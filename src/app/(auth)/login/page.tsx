'use client'

import { useState } from 'react'
import { signIn } from '@/actions/auth.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { APP_NAME } from '@/lib/constants'
import { Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

import { Suspense } from 'react'

function LoginContent() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const registered = searchParams.get('registered')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    try {
      const res = await signIn(formData)
      if (res?.error) {
        setError(res.error)
      }
    } catch (err) {
      if ((err as Error).message === 'NEXT_REDIRECT') {
        throw err 
      }
      setError('Ocorreu um erro ao fazer login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl border shadow-sm">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Bem-vindo ao {APP_NAME}</h1>
        <p className="text-sm text-muted-foreground">Entre na sua conta para continuar</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {registered && (
          <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
            Conta criada! Você já pode fazer login.
          </div>
        )}
        
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="nome@exemplo.com" required disabled={loading} />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
          </div>
          <Input id="password" name="password" type="password" required disabled={loading} />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Entrar
        </Button>
      </form>

      <div className="text-center text-sm">
        Não tem uma conta?{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Cadastre-se
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>}>
      <LoginContent />
    </Suspense>
  )
}
