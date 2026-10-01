import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

export async function lookupQRCode(code: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('qr_codes')
    .select('id, code, status, destination_url, destination_type')
    .eq('code', code.toUpperCase())
    .single()
  
  if (error || !data) return null
  return data
}

export function detectDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase()
  if (/mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(ua)) {
    return 'mobile'
  }
  if (/tablet|ipad/i.test(ua)) {
    return 'tablet'
  }
  return 'desktop'
}

export function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + 'qr-salt-2024').digest('hex').slice(0, 16)
}

export async function recordScan(
  qrCodeId: string,
  userAgent: string | null,
  ipAddress: string | null
) {
  const supabase = createAdminClient()
  // Fire and forget - don't await in the redirect path
  supabase.from('qr_scans').insert({
    qr_code_id: qrCodeId,
    user_agent: userAgent?.slice(0, 500) || null,
    ip_hash: ipAddress ? hashIP(ipAddress) : null,
    device_type: userAgent ? detectDeviceType(userAgent) : null,
  }).then(() => {}) // intentionally not awaited for performance
}
