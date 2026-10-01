'use client'

import { useState } from 'react'
import { whatsappFormSchema, buildWhatsAppUrl } from '@/validators/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import { z } from 'zod'

interface WhatsAppFormProps {
  onSubmit: (url: string) => void
  onBack: () => void
}

export function WhatsAppForm({ onSubmit, onBack }: WhatsAppFormProps) {
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<{ phone?: string; message?: string }>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const data = whatsappFormSchema.parse({ phone, message })
      const url = buildWhatsAppUrl(data.phone, data.message)
      onSubmit(url)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: any = {}
        ;(error as any).errors.forEach((err: any) => {
          if (err.path[0]) newErrors[err.path[0]] = err.message
        })
        setErrors(newErrors)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-lg">Número do WhatsApp</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+55 11 99999-9999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="text-lg py-6"
          />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="message" className="text-lg">Mensagem (opcional)</Label>
          <Textarea
            id="message"
            placeholder="Olá! Gostaria de saber mais."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="text-lg min-h-[120px]"
          />
          {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}
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
          className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
        >
          Continuar <MessageCircle className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </form>
  )
}
