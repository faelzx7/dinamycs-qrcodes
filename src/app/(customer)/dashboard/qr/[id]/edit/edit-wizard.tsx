'use client'

import { useState } from 'react'
import { QRCode, DestinationType } from '@/types/database'
import { updateQRAction } from '@/actions/qr.actions'
import { DestinationSelector } from '@/components/forms/destination-selector'
import { WhatsAppForm } from '@/components/forms/whatsapp-form'
import { InstagramForm } from '@/components/forms/instagram-form'
import { WebsiteForm } from '@/components/forms/website-form'
import { CustomUrlForm } from '@/components/forms/custom-url-form'
import { GoogleForm } from '@/components/forms/google-form'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EditWizardProps {
  qr: QRCode
}

export function EditWizard({ qr }: EditWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedType, setSelectedType] = useState<DestinationType>(
    (qr.destination_type as DestinationType) || 'website'
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTypeSelect = (type: DestinationType) => {
    setSelectedType(type)
    setStep(2)
  }

  const handleFormSubmit = async (url: string, metadata?: any) => {
    setLoading(true)
    setError(null)
    try {
      const result = await updateQRAction({
        qr_id: qr.id,
        destination_type: selectedType,
        destination_url: url
      })

      if (result.success) {
        setStep(3)
      } else {
        setError(result.error || 'Erro ao atualizar destino')
      }
    } catch (err) {
      setError('Erro inesperado ao salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const renderForm = () => {
    const props = { onSubmit: handleFormSubmit, onBack: () => setStep(1), isLoading: loading }
    switch (selectedType) {
      case 'whatsapp': return <WhatsAppForm {...props} />
      case 'instagram': return <InstagramForm {...props} />
      case 'google': return <GoogleForm {...props} />
      case 'website': return <WebsiteForm {...props} />
      case 'custom': return <CustomUrlForm {...props} />
      default: return <CustomUrlForm {...props} />
    }
  }

  if (step === 3) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-6 bg-card border border-border/40 rounded-xl text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500" />
        <div>
          <h2 className="text-2xl font-bold">Destino Atualizado!</h2>
          <p className="text-muted-foreground mt-2">Sua placa {qr.code} agora aponta para o novo destino.</p>
        </div>
        <Button onClick={() => router.push(`/dashboard/qr/${qr.id}`)}>
          Voltar para Detalhes
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => step === 2 ? setStep(1) : router.push(`/dashboard/qr/${qr.id}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Alterar Destino</h1>
          <p className="text-muted-foreground text-sm">Placa: {qr.code}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-500 p-4 rounded-md text-sm font-medium border border-red-500/20">
          {error}
        </div>
      )}

      <div className="bg-card border border-border/40 rounded-xl p-6">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Escolha o novo tipo de destino</h2>
            <DestinationSelector onSelect={handleTypeSelect} selected={selectedType} />
          </div>
        )}
        
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Configure os detalhes</h2>
            {renderForm()}
          </div>
        )}
      </div>
    </div>
  )
}
