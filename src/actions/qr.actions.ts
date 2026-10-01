'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { configureQRCode, updateQRDestination } from '@/services/qr-configuration.service'
import { configureQRSchema, updateDestinationSchema } from '@/validators/schemas'
import type { DestinationType } from '@/types/database'
import { revalidatePath } from 'next/cache'

export async function getQRCodeByCode(code: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .single()

  if (error || !data) return null
  return data
}

export async function configureQR(formData: {
  code: string
  destination_type: DestinationType
  destination_url: string
}) {
  // Validate input
  const parsed = configureQRSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: (parsed.error as any).errors[0]?.message || 'Dados inválidos' }
  }

  // Get current user (may or may not be authenticated)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let ownerId: string

  if (user) {
    ownerId = user.id
  } else {
    // Create a temporary anonymous sign-up or require auth
    // For the MVP, require the user to create an account to configure
    return { error: 'Você precisa criar uma conta para configurar sua placa.', requireAuth: true }
  }

  const result = await configureQRCode(
    parsed.data.code,
    parsed.data.destination_type,
    parsed.data.destination_url,
    ownerId
  )

  if (!result.success) {
    return { error: result.error }
  }

  return { success: true }
}

export async function updateQRAction(formData: {
  qr_id: string
  destination_type: DestinationType
  destination_url: string
}) {
  // Validate input
  const parsed = updateDestinationSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: (parsed.error as any).errors[0]?.message || 'Dados inválidos' }
  }

  // Get current user
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  const result = await updateQRDestination(
    parsed.data.qr_id,
    parsed.data.destination_type,
    parsed.data.destination_url,
    user.id
  )

  if (!result.success) {
    return { error: result.error }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
