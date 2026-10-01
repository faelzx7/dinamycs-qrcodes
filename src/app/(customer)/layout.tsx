import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CustomerSidebar } from '@/components/layout/customer-sidebar'

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <CustomerSidebar user={{ email: user.email || '' }} />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  )
}
