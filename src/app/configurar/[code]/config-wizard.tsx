'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DestinationType } from '@/types/database'
import { configureQR } from '@/actions/qr.actions'
import { DestinationSelector } from '@/components/forms/destination-selector'
import { WhatsAppForm } from '@/components/forms/whatsapp-form'
import { InstagramForm } from '@/components/forms/instagram-form'
import { GoogleForm } from '@/components/forms/google-form'
import { WebsiteForm } from '@/components/forms/website-form'
import { CustomUrlForm } from '@/components/forms/custom-url-form'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowLeft, LogIn } from 'lucide-react'

type WizardStep = 'select' | 'form' | 'confirm' | 'success' | 'error'

interface ConfigWizardProps {
  code: string
  isAuthenticated: boolean
}

export function ConfigWizard({ code, isAuthenticated }: ConfigWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState<WizardStep>('select')
  const [selectedType, setSelectedType] = useState<DestinationType | null>(null)
  const [destinationUrl, setDestinationUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTypeSelect = (type: DestinationType) => {
    setSelectedType(type)
    setStep('form')
  }

  const handleFormSubmit = (url: string) => {
    setDestinationUrl(url)
    setStep('confirm')
  }

  const handleConfirm = async () => {
    if (!isAuthenticated) {
      const redirectUrl = `/configurar/${code}`
      const loginUrl = `/login?redirect=${encodeURIComponent(redirectUrl)}&type=${selectedType}&url=${encodeURIComponent(destinationUrl)}`
      router.push(loginUrl)
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (!selectedType) throw new Error('Tipo não selecionado')
      
      const result = await configureQR({
        code, 
        destination_type: selectedType, 
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

  const renderForm = () => {
    switch (selectedType) {
      case 'whatsapp': return <WhatsAppForm onSubmit={handleFormSubmit} onBack={() => setStep('select')} />
      case 'instagram': return <InstagramForm onSubmit={handleFormSubmit} onBack={() => setStep('select')} />
      case 'google': return <GoogleForm onSubmit={handleFormSubmit} onBack={() => setStep('select')} />
      case 'website': return <WebsiteForm onSubmit={handleFormSubmit} onBack={() => setStep('select')} />
      case 'custom': return <CustomUrlForm onSubmit={handleFormSubmit} onBack={() => setStep('select')} />
      default: return null
    }
  }

  return (
    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
      {/* Progress Indicator */}
      {step !== 'success' && (
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className={`w-3 h-3 rounded-full ${step === 'select' ? 'bg-white' : 'bg-zinc-700'}`} />
          <div className={`w-3 h-3 rounded-full ${step === 'form' ? 'bg-white' : 'bg-zinc-700'}`} />
          <div className={`w-3 h-3 rounded-full ${step === 'confirm' || step === 'error' ? 'bg-white' : 'bg-zinc-700'}`} />
        </div>
      )}

      {step === 'select' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Escolha o destino</h2>
            <p className="text-zinc-400">Para onde as pessoas devem ir ao ler sua placa?</p>
          </div>
          <DestinationSelector onSelect={handleTypeSelect} />
        </div>
      )}

      {step === 'form' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Configure o destino</h2>
            <p className="text-zinc-400">Preencha os dados abaixo para direcionar seus clientes.</p>
          </div>
          <div className="bg-white text-zinc-950 p-6 rounded-xl">
            {renderForm()}
          </div>
        </div>
      )}

      {step === 'confirm' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Quase pronto!</h2>
            <p className="text-zinc-400">Confirme as informações antes de ativar.</p>
          </div>
          
          <div className="bg-zinc-800 p-6 rounded-xl space-y-4">
            <p className="text-sm text-zinc-400">Seu QR Code será direcionado para:</p>
            <div className="bg-zinc-950 p-4 rounded-lg break-all font-mono text-zinc-300">
              {destinationUrl}
            </div>
            {!isAuthenticated && (
              <div className="bg-blue-900/30 border border-blue-800 p-4 rounded-lg flex items-start space-x-3 mt-4">
                <LogIn className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-200">
                  Para ativar sua placa, você precisará criar uma conta ou fazer login. 
                  Isso permite que você edite o destino depois.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleConfirm}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg py-6 h-auto"
            >
              {loading ? 'Ativando...' : (isAuthenticated ? 'Ativar minha placa' : 'Fazer Login e Ativar')}
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setStep('form')}
              disabled={loading}
              className="text-zinc-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar e editar
            </Button>
          </div>
        </div>
      )}

      {step === 'error' && (
        <div className="space-y-6 text-center animate-in fade-in">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Ops, algo deu errado</h2>
          <p className="text-zinc-400">{error}</p>
          <Button 
            onClick={() => setStep('confirm')}
            className="mt-4"
          >
            Tentar novamente
          </Button>
        </div>
      )}

      {step === 'success' && (
        <div className="space-y-8 text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="flex justify-center">
            <div className="bg-green-500/20 p-4 rounded-full">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-white">Placa configurada!</h2>
            <p className="text-zinc-400 leading-relaxed max-w-sm mx-auto">
              Agora, sempre que alguém escanear este QR Code, será direcionado para o destino escolhido.
            </p>
          </div>
          <div className="pt-4">
            <Button 
              onClick={() => router.push('/dashboard')}
              className="w-full bg-white text-zinc-950 hover:bg-zinc-200 text-lg py-6"
            >
              Ir para o Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
