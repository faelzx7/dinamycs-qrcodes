import Link from 'next/link'
import { QrCode, Shield, Zap, Smartphone, BarChart3, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { APP_NAME } from '@/lib/constants'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="h-6 w-6 text-emerald-400" />
            <span className="font-semibold text-lg">{APP_NAME}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                Entrar
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Criar conta
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 md:py-32 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-6">
          <Zap className="h-3.5 w-3.5" />
          QR Codes Dinâmicos para Placas Físicas
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-3xl mx-auto leading-tight">
          Um QR Code.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            Destino infinito.
          </span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Gere QR Codes para suas placas físicas que nunca precisam ser reimpressos.
          Altere o destino a qualquer momento — WhatsApp, Instagram, site ou qualquer link.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 h-12 text-base">
              Começar agora
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 px-8 h-12 text-base">
              Já tenho conta
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20 border-t border-white/5">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
          Como funciona
        </h2>
        <p className="text-zinc-400 text-center mb-12 max-w-xl mx-auto">
          Simples, rápido e profissional. O fluxo completo em três passos.
        </p>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800/50">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
              <QrCode className="h-5 w-5 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-lg mb-2">1. Gere os QR Codes</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Crie centenas ou milhares de QR Codes únicos em massa, prontos para impressão em placas físicas.
            </p>
          </div>
          <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800/50">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
              <Smartphone className="h-5 w-5 text-cyan-400" />
            </div>
            <h3 className="font-semibold text-lg mb-2">2. Cliente escaneia</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Ao escanear pela primeira vez, o cliente configura o destino — WhatsApp, Instagram, site ou qualquer link.
            </p>
          </div>
          <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800/50">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
              <RefreshCw className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="font-semibold text-lg mb-2">3. Altere quando quiser</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              O destino pode ser alterado a qualquer momento sem reimprimir o QR Code. Ele é dinâmico.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-20 border-t border-white/5">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="flex items-start gap-4 p-4">
            <Shield className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium mb-1">Seguro</h4>
              <p className="text-sm text-zinc-400">Cada placa é protegida. Só o proprietário pode alterar o destino.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4">
            <Zap className="h-5 w-5 text-cyan-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium mb-1">Ultra rápido</h4>
              <p className="text-sm text-zinc-400">Redirecionamento instantâneo. Sem páginas intermediárias.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4">
            <BarChart3 className="h-5 w-5 text-purple-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium mb-1">Analytics</h4>
              <p className="text-sm text-zinc-400">Acompanhe quantas vezes cada placa foi escaneada.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="container mx-auto px-4 text-center text-zinc-500 text-sm">
          © {new Date().getFullYear()} {APP_NAME}. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}
