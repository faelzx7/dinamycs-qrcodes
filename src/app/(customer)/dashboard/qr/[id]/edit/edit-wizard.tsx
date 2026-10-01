'use client'

import { useState } from 'react'
import { QRCode } from '@/types/database'
import { updateQRAction } from '@/actions/qr.actions'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface EditWizardProps {
  qr: QRCode
}

export function EditWizard({ qr }: EditWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [name, setName] = useState(qr.name || '')
  const [destinationUrl, setDestinationUrl] = useState(qr.destination_url || '')
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

    setLoading(true)
    setError(null)

    try {
      const result = await updateQRAction({
        qr_id: qr.id,
        name: name,
        destination_type: 'custom',
        destination_url: destinationUrl
      })

      if (result.success) {
        setStep(2)
      } else {
        setError(result.error || 'Erro ao atualizar destino')
      }
    } catch (err) {
      setError('Erro inesperado ao salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 2) {
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
        <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/qr/${qr.id}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar Placa</h1>
          <p className="text-muted-foreground text-sm">Código: {qr.code}</p>
        </div>
      </div>

      <div className="bg-card border border-border/40 rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 text-red-500 p-4 rounded-md text-sm font-medium border border-red-500/20 mb-4">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Placa</Label>
            <Input 
              id="name"
              placeholder="Ex: Mesa 01, Balcão Principal" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor="url">URL de Destino</Label>
            <Input 
              id="url"
              type="url"
              placeholder="https://seusite.com ou https://wa.me/..." 
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={loading} className="px-8">
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
