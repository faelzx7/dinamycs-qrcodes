import { createClient } from '@/lib/supabase/server'
import { QRCodeCard } from '@/components/qr/qr-code-card'
import { StatsCard } from '@/components/analytics/stats-card'
import { getScanStats } from '@/services/analytics.service'
import { QrCode, MousePointerClick, Calendar } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: qrCodes, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  const qrs = qrCodes || []

  const qrsWithStats = await Promise.all(
    qrs.map(async (qr) => {
      const stats = await getScanStats(qr.id)
      return {
        qr,
        stats: stats || { total: 0, today: 0, last_7_days: 0, last_30_days: 0 }
      }
    })
  )

  const totalQrs = qrs.length
  const totalScans = qrsWithStats.reduce((acc, curr) => acc + (curr.stats.total || 0), 0)
  const totalToday = qrsWithStats.reduce((acc, curr) => acc + (curr.stats.today || 0), 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Visão geral das suas placas e estatísticas de uso.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard 
          title="Total de Placas" 
          value={totalQrs} 
          icon={<QrCode className="h-4 w-4" />} 
        />
        <StatsCard 
          title="Total de Scans" 
          value={totalScans} 
          icon={<MousePointerClick className="h-4 w-4" />} 
        />
        <StatsCard 
          title="Scans Hoje" 
          value={totalToday} 
          icon={<Calendar className="h-4 w-4" />} 
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Minhas Placas</h2>
        {qrs.length === 0 ? (
          <div className="p-8 text-center bg-card border border-border/40 rounded-lg">
            <QrCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nenhuma placa encontrada</h3>
            <p className="text-muted-foreground mt-2">Você ainda não possui placas QR ativas.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {qrsWithStats.map(({ qr, stats }) => (
              <QRCodeCard 
                key={qr.id} 
                qr={qr} 
                scanCount={stats.total}
                scansToday={stats.today}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
