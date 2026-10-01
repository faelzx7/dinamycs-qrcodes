'use client'

import { useState } from 'react'
import { safeUrlSchema } from '@/validators/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Globe } from 'lucide-react'
import { z } from 'zod'

interface WebsiteFormProps {
  onSubmit: (url: string) => void
  onBack: () => void
}

export function WebsiteForm({ onSubmit, onBack }: WebsiteFormProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const urlToValidate = url.startsWith('http') ? url : `https://${url}`
      const validUrl = safeUrlSchema.parse(urlToValidate)
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
          <Label htmlFor="url" className="text-lg">Endereço do Site</Label>
          <Input
            id="url"
            type="text"
            placeholder="www.seusite.com.br"
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
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg py-6"
        >
          Continuar <Globe className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </form>
  )
}
