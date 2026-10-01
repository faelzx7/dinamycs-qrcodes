import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/layout/admin-sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Use Admin Client to bypass RLS and fetch exact role securely
  const adminSupabase = createAdminClient()
  const { data: profile, error } = await adminSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  console.log('ADMIN LAYOUT CHECK -> user:', user.id, 'profile:', profile, 'error:', error)
  
  if (!profile || profile.role !== 'admin') {
    console.log('REDIRECTING TO DASHBOARD!')
    redirect('/dashboard')
  }
  
  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <AdminSidebar user={{ email: user.email || '' }} />
      <main className="flex-1 md:ml-64 overflow-auto">
        <div className="container mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
