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
    return (
      <div className="p-8 bg-black text-red-500 font-mono">
        <h1 className="text-2xl font-bold mb-4">Acesso Negado - Debug Info</h1>
        <p><strong>User ID:</strong> {user.id}</p>
        <p><strong>Profile Data:</strong> {JSON.stringify(profile)}</p>
        <p><strong>Database Error:</strong> {JSON.stringify(error)}</p>
        <div className="mt-4">
          <a href="/dashboard" className="text-white underline">Voltar pro Dashboard</a>
        </div>
      </div>
    )
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
