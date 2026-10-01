import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EditWizard } from './edit-wizard'

export default async function EditQRCodePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: qr, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (error || !qr) {
    redirect('/dashboard')
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <EditWizard qr={qr} />
    </div>
  )
}
