import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getScanStats, getDailyScans } from '@/services/analytics.service'
import { StatsCard } from '@/components/analytics/stats-card'
import { ScanChart } from '@/components/analytics/scan-chart'
import { QRCodeStatus } from '@/components/qr/qr-code-status'
import { Button } from '@/components/ui/button'
import { DESTINATION_TYPES } from '@/lib/constants'
import { MousePointerClick, Calendar, ArrowLeft, Settings, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default async function QRCodeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: qr, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (error || !qr) {
    redirect('/dashboard')
  }

  const [stats, dailyScans] = await Promise.all([
    getScanStats(id),
    getDailyScans(id, 30)
  ])

  const destConfig = DESTINATION_TYPES.find(d => d.value === qr.destination_type)
  const destName = destConfig?.label || 'Não configurado'

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold font-mono tracking-wider">{qr.code}</h1>
              <QRCodeStatus status={qr.status} />
            </div>
            <p className="text-muted-foreground mt-1 text-sm">Criado em {new Date(qr.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <Link href={`/dashboard/qr/${qr.id}/edit`}>
          <Button>
            <Settings className="mr-2 h-4 w-4" /> Editar Destino
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard title="Total" value={stats?.total || 0} icon={<MousePointerClick className="h-4 w-4" />} />
        <StatsCard title="Hoje" value={stats?.today || 0} icon={<Calendar className="h-4 w-4" />} />
        <StatsCard title="Últimos 7 dias" value={stats?.last_7_days || 0} />
        <StatsCard title="Últimos 30 dias" value={stats?.last_30_days || 0} />
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <ScanChart data={dailyScans || []} />
        </div>
        
        <div className="space-y-6">
          <div className="bg-card border border-border/40 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Destino Atual</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tipo</p>
                <p className="font-medium">{destName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">URL</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm break-all">{qr.destination_url || 'Nenhuma URL configurada'}</p>
                </div>
              </div>
              {qr.destination_url && (
                <a href={qr.destination_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full mt-2">
                    <ExternalLink className="mr-2 h-4 w-4" /> Testar Destino
                  </Button>
                </a>
              )}
            </div>
          </div>
          
          <div className="bg-card border border-border/40 rounded-xl p-6 flex flex-col items-center justify-center space-y-4">
             <h3 className="text-lg font-semibold w-full text-left">Placa</h3>
             <div className="bg-white p-4 rounded-lg">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/r/${qr.code}`)}`} 
                  alt={`QR Code ${qr.code}`} 
                  className="w-32 h-32"
                />
             </div>
             <p className="text-xs text-muted-foreground text-center">URL Pública:<br/> {`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/r/${qr.code}`}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
