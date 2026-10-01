'use client'

import { useState } from 'react'
import { googleUrlSchema } from '@/validators/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, MapPin } from 'lucide-react'
import { z } from 'zod'

interface GoogleFormProps {
  onSubmit: (url: string) => void
  onBack: () => void
}

export function GoogleForm({ onSubmit, onBack }: GoogleFormProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const validUrl = googleUrlSchema.parse(url)
      onSubmit(validUrl)
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError((err as any).errors[0]?.message || 'URL inválida')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="url" className="text-lg">Link do Google Maps/Meu Negócio</Label>
          <Input
            id="url"
            type="url"
            placeholder="https://maps.google.com/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="text-lg py-6"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onBack}
          className="w-full sm:w-auto text-lg py-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
        </Button>
        <Button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
        >
          Continuar <MapPin className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </form>
  )
}
