import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getQRCodeByCode } from '@/actions/qr.actions'
import { ConfigWizard } from './config-wizard'
import { APP_NAME } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import { Loader2 } from 'lucide-react'

interface PageProps {
  params: Promise<{ code: string }>
}

export default async function ConfigurarPage(props: PageProps) {
  const params = await props.params
  
  if (!params.code) {
    notFound()
  }

  const qrCode = await getQRCodeByCode(params.code)
  
  if (!qrCode) {
    notFound()
  }

  if (qrCode.status !== 'unconfigured') {
    redirect(`/q/${params.code}`)
  }
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col items-center p-4 sm:p-8">
      <header className="w-full max-w-2xl text-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white">{APP_NAME}</h1>
        <p className="text-sm text-zinc-400 mt-2">Configuração da Placa: <span className="font-mono text-zinc-300 ml-1 bg-zinc-900 px-2 py-1 rounded">{params.code}</span></p>
      </header>

      <main className="w-full max-w-2xl flex-1 flex flex-col">
        <Suspense fallback={
          <div className="w-full p-12 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-400 mb-2" />
            <p className="text-sm text-zinc-500">Carregando formulário...</p>
          </div>
        }>
          <ConfigWizard code={params.code} isAuthenticated={!!user} />
        </Suspense>
      </main>
    </div>
  )
}
