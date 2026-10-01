'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createBatch } from '@/services/batch-generation.service'
import { getAdminStats } from '@/services/analytics.service'
import { generateBatchSchema } from '@/validators/schemas'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    throw new Error('Acesso negado')
  }

  return user
}

export async function generateBatchAction(formData: { name: string; quantity: number }) {
  const user = await requireAdmin()

  const parsed = generateBatchSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: (parsed.error as any).errors[0]?.message || 'Dados inválidos' }
  }

  const result = await createBatch(parsed.data.name, parsed.data.quantity, user.id)

  if (!result.success) {
    return { error: result.error }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/qr-generator')
  revalidatePath('/admin/batches')

  return { success: true, batchId: result.batchId }
}

export async function getAdminDashboardStats() {
  await requireAdmin()
  return getAdminStats()
}

export async function getAdminQRCodes(filters?: {
  status?: string
  search?: string
  batch_id?: string
  page?: number
  per_page?: number
}) {
  await requireAdmin()

  const supabase = createAdminClient()
  const page = filters?.page || 1
  const perPage = filters?.per_page || 50
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let query = supabase
    .from('qr_codes')
    .select('*, qr_batches(name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters?.search) {
    query = query.ilike('code', `%${filters.search}%`)
  }

  if (filters?.batch_id) {
    query = query.eq('batch_id', filters.batch_id)
  }

  const { data, error, count } = await query

  if (error) return { data: [], total: 0 }

  return { data: data || [], total: count || 0 }
}

export async function getBatches() {
  await requireAdmin()

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('qr_batches')
    .select('*, qr_codes(count)')
    .order('created_at', { ascending: false })

  return data || []
}

export async function getBatchQRCodes(batchId: string) {
  await requireAdmin()

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('batch_id', batchId)
    .order('created_at', { ascending: true })

  return data || []
}

export async function toggleQRCodeStatus(qrId: string, newStatus: 'active' | 'disabled') {
  await requireAdmin()

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('qr_codes')
    .update({ status: newStatus })
    .eq('id', qrId)
    .in('status', ['active', 'disabled'])

  if (error) {
    return { error: 'Erro ao atualizar status' }
  }

  revalidatePath('/admin/qr')
  return { success: true }
}

export async function exportBatchCSV(batchId: string) {
  await requireAdmin()

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('qr_codes')
    .select('code, status, destination_type, destination_url, created_at, configured_at')
    .eq('batch_id', batchId)
    .order('created_at', { ascending: true })

  if (!data || data.length === 0) return ''

  const headers = 'code,status,destination_type,destination_url,created_at,configured_at'
  const rows = data.map((row) =>
    [
      row.code,
      row.status,
      row.destination_type || '',
      row.destination_url || '',
      row.created_at,
      row.configured_at || '',
    ].join(',')
  )

  return [headers, ...rows].join('\n')
}
