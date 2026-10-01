'use client'

import { useState } from 'react'
import { safeUrlSchema } from '@/validators/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Link as LinkIcon, AlertCircle } from 'lucide-react'
import { z } from 'zod'

interface CustomUrlFormProps {
  onSubmit: (url: string) => void
  onBack: () => void
}

export function CustomUrlForm({ onSubmit, onBack }: CustomUrlFormProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const validUrl = safeUrlSchema.parse(url)
      onSubmit(validUrl)
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError((err as any).errors[0]?.message || 'URL inválida. Use http:// ou https://')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="url" className="text-lg">URL Personalizada</Label>
          <Input
            id="url"
            type="url"
            placeholder="https://qualquer-link.com/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="text-lg py-6"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <div className="flex items-start text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md mt-2">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <p>O link deve começar obrigatoriamente com <strong>http://</strong> ou <strong>https://</strong></p>
          </div>
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
          className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-6"
        >
          Continuar <LinkIcon className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </form>
  )
}
