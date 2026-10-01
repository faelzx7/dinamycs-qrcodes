import { getAdminDashboardStats } from '@/actions/admin.actions'
import { StatsCard } from '@/components/analytics/stats-card'
import { QrCode, CheckCircle2, XCircle, Ban, Activity, CalendarDays, BarChart, Package } from 'lucide-react'

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats()
  
  if (!stats) {
    return <div>Erro ao carregar estatísticas.</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Painel Administrativo</h1>
        <p className="text-muted-foreground mt-2">Visão geral do sistema de QR Codes.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total QR Codes"
          value={stats.total_qr_codes.toString()}
          icon={<QrCode className="h-4 w-4" />}
        />
        <StatsCard
          title="Configurados"
          value={stats.configured.toString()}
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <StatsCard
          title="Não Configurados"
          value={stats.unconfigured.toString()}
          icon={<XCircle className="h-4 w-4" />}
        />
        <StatsCard
          title="Desativados"
          value={stats.disabled.toString()}
          icon={<Ban className="h-4 w-4" />}
        />
        <StatsCard
          title="Total de Scans"
          value={stats.total_scans.toString()}
          icon={<Activity className="h-4 w-4" />}
        />
        <StatsCard
          title="Scans Hoje"
          value={stats.scans_today.toString()}
          icon={<BarChart className="h-4 w-4" />}
        />
        <StatsCard
          title="Scans 7 dias"
          value={stats.scans_7_days.toString()}
          icon={<CalendarDays className="h-4 w-4" />}
        />
        <StatsCard
          title="Total de Lotes"
          value={stats.total_batches.toString()}
          icon={<Package className="h-4 w-4" />}
        />
      </div>
    </div>
  )
}
