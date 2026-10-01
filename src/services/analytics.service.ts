import { createAdminClient } from '@/lib/supabase/admin'
import type { DailyScanCount, ScanStats } from '@/types/database'

export async function getScanStats(qrCodeId: string): Promise<ScanStats> {
  const supabase = createAdminClient()
  const now = new Date()
  
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const last7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [totalRes, todayRes, week7Res, month30Res] = await Promise.all([
    supabase.from('qr_scans').select('id', { count: 'exact', head: true }).eq('qr_code_id', qrCodeId),
    supabase.from('qr_scans').select('id', { count: 'exact', head: true }).eq('qr_code_id', qrCodeId).gte('scanned_at', today),
    supabase.from('qr_scans').select('id', { count: 'exact', head: true }).eq('qr_code_id', qrCodeId).gte('scanned_at', last7),
    supabase.from('qr_scans').select('id', { count: 'exact', head: true }).eq('qr_code_id', qrCodeId).gte('scanned_at', last30),
  ])

  return {
    total: totalRes.count || 0,
    today: todayRes.count || 0,
    last_7_days: week7Res.count || 0,
    last_30_days: month30Res.count || 0,
  }
}

export async function getDailyScans(qrCodeId: string, days: number = 30): Promise<DailyScanCount[]> {
  const supabase = createAdminClient()
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data } = await supabase
    .from('qr_scans')
    .select('scanned_at')
    .eq('qr_code_id', qrCodeId)
    .gte('scanned_at', since)
    .order('scanned_at', { ascending: true })

  if (!data) return []

  // Group by date
  const grouped: Record<string, number> = {}
  data.forEach((scan) => {
    const date = scan.scanned_at.split('T')[0]
    grouped[date] = (grouped[date] || 0) + 1
  })

  // Fill in missing dates
  const result: DailyScanCount[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const dateStr = d.toISOString().split('T')[0]
    result.push({ date: dateStr, count: grouped[dateStr] || 0 })
  }

  return result
}

export async function getAdminStats() {
  const supabase = createAdminClient()
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const last7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [totalQR, configuredQR, unconfiguredQR, disabledQR, totalScans, scansToday, scans7Days, totalBatches] = await Promise.all([
    supabase.from('qr_codes').select('id', { count: 'exact', head: true }),
    supabase.from('qr_codes').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('qr_codes').select('id', { count: 'exact', head: true }).eq('status', 'unconfigured'),
    supabase.from('qr_codes').select('id', { count: 'exact', head: true }).eq('status', 'disabled'),
    supabase.from('qr_scans').select('id', { count: 'exact', head: true }),
    supabase.from('qr_scans').select('id', { count: 'exact', head: true }).gte('scanned_at', today),
    supabase.from('qr_scans').select('id', { count: 'exact', head: true }).gte('scanned_at', last7),
    supabase.from('qr_batches').select('id', { count: 'exact', head: true }),
  ])

  return {
    total_qr_codes: totalQR.count || 0,
    configured: configuredQR.count || 0,
    unconfigured: unconfiguredQR.count || 0,
    disabled: disabledQR.count || 0,
    total_scans: totalScans.count || 0,
    scans_today: scansToday.count || 0,
    scans_7_days: scans7Days.count || 0,
    total_batches: totalBatches.count || 0,
  }
}
