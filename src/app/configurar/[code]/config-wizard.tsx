'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { configureQR } from '@/actions/qr.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2, LogIn } from 'lucide-react'

type WizardStep = 'form' | 'success' | 'error'

interface ConfigWizardProps {
  code: string
  isAuthenticated: boolean
}

export function ConfigWizard({ code, isAuthenticated }: ConfigWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState<WizardStep>('form')
  const [name, setName] = useState('')
  const [destinationUrl, setDestinationUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('O nome é obrigatório')
      return
    }

    if (!destinationUrl.trim() || (!destinationUrl.startsWith('http://') && !destinationUrl.startsWith('https://'))) {
      setError('Insira uma URL válida (deve começar com http:// ou https://)')
      return
    }

    if (!isAuthenticated) {
      const redirectUrl = `/configurar/${code}`
      // Remove destination type since it's hardcoded to 'custom' now
      const loginUrl = `/login?redirect=${encodeURIComponent(redirectUrl)}&type=custom&url=${encodeURIComponent(destinationUrl)}&name=${encodeURIComponent(name)}`
      router.push(loginUrl)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await configureQR({
        code,
        name,
        destination_type: 'custom',
        destination_url: destinationUrl
      })
      
      if (result.success) {
        setStep('success')
      } else {
        throw new Error(result.error || 'Erro ao configurar placa')
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado')
      setStep('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
      {step === 'form' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Configure sua Placa</h2>
            <p className="text-zinc-400">Dê um nome para identificar a placa e insira o link de destino.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 bg-zinc-800 p-6 rounded-xl">
            {error && (
              <div className="p-4 rounded-lg bg-red-900/50 border border-red-800 text-red-200 text-sm mb-4">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-200">Nome da Placa</Label>
              <Input 
                id="name"
                placeholder="Ex: Mesa 01, Balcão Principal" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-zinc-950 border-zinc-700 text-white h-12"
              />
            </div>

            <div className="space-y-2 pt-2">
              <Label htmlFor="url" className="text-zinc-200">URL de Destino</Label>
              <Input 
                id="url"
                type="url"
                placeholder="https://seusite.com ou https://wa.me/..." 
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
                className="bg-zinc-950 border-zinc-700 text-white h-12"
              />
            </div>

            {!isAuthenticated && (
              <div className="bg-blue-900/30 border border-blue-800 p-4 rounded-lg flex items-start space-x-3 mt-6">
                <LogIn className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-200">
                  Para ativar sua placa, você precisará criar uma conta ou fazer login. 
                  Isso permite que você edite o destino depois.
                </p>
              </div>
            )}

            <Button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg py-6 h-auto mt-6"
            >
              {loading ? 'Ativando...' : (isAuthenticated ? 'Ativar minha placa' : 'Fazer Login e Ativar')}
            </Button>
          </form>
        </div>
      )}

      {step === 'success' && (
        <div className="text-center space-y-6 animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-white">Placa Ativada!</h2>
          <p className="text-zinc-400 max-w-md mx-auto text-lg">
            Sua placa já está funcionando e redirecionando para o link escolhido.
          </p>
          <div className="pt-8">
            <Button 
              onClick={() => router.push('/dashboard')}
              className="bg-white text-black hover:bg-zinc-200 text-lg px-8 py-6 h-auto rounded-full font-medium"
            >
              Ir para o meu Painel
            </Button>
          </div>
        </div>
      )}

      {step === 'error' && (
        <div className="text-center space-y-6 animate-in fade-in">
          <div className="text-red-400 mb-6">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Ops, algo deu errado</h2>
          <p className="text-zinc-400">{error}</p>
          <Button 
            onClick={() => setStep('form')}
            variant="outline"
            className="mt-6 border-zinc-700 text-white hover:bg-zinc-800"
          >
            Tentar novamente
          </Button>
        </div>
      )}
    </div>
  )
}
