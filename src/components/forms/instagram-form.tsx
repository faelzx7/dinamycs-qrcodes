'use client'

import { useState } from 'react'
import { instagramUsernameSchema, buildInstagramUrl } from '@/validators/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Camera } from 'lucide-react'
import { z } from 'zod'

interface InstagramFormProps {
  onSubmit: (url: string) => void
  onBack: () => void
}

export function InstagramForm({ onSubmit, onBack }: InstagramFormProps) {
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const validUsername = instagramUsernameSchema.parse(username)
      const url = buildInstagramUrl(validUsername)
      onSubmit(url)
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError((err as any).errors[0]?.message || 'Username inválido')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-lg">Nome de Usuário</Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">@</span>
            <Input
              id="username"
              type="text"
              placeholder="seunegocio"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="text-lg py-6 pl-10"
            />
          </div>
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
          className="w-full bg-pink-600 hover:bg-pink-700 text-lg py-6"
        >
          Continuar <Camera className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </form>
  )
}
