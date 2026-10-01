import { createAdminClient } from '@/lib/supabase/admin'
import type { DestinationType } from '@/types/database'

/**
 * Configure a QR code for the first time (atomic operation to prevent race conditions).
 * Uses UPDATE with WHERE status = 'unconfigured' to ensure atomicity.
 */
export async function configureQRCode(
  code: string,
  destinationType: DestinationType,
  destinationUrl: string,
  ownerId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('qr_codes')
    .update({
      status: 'active',
      destination_type: destinationType,
      destination_url: destinationUrl,
      owner_id: ownerId,
      configured_at: new Date().toISOString(),
    })
    .eq('code', code.toUpperCase())
    .eq('status', 'unconfigured')
    .select()
    .single()
  
  if (error || !data) {
    return { success: false, error: 'Este QR Code já foi configurado ou não existe.' }
  }
  
  return { success: true }
}

/**
 * Update the destination of an already-configured QR code.
 * Only the owner can do this (enforced by RLS + explicit check here).
 */
export async function updateQRDestination(
  qrId: string,
  destinationType: DestinationType,
  destinationUrl: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()
  
  // First verify ownership
  const { data: qr } = await supabase
    .from('qr_codes')
    .select('id, owner_id, status')
    .eq('id', qrId)
    .single()
  
  if (!qr) {
    return { success: false, error: 'QR Code não encontrado.' }
  }
  
  if (qr.owner_id !== userId) {
    return { success: false, error: 'Você não tem permissão para editar este QR Code.' }
  }
  
  if (qr.status === 'unconfigured') {
    return { success: false, error: 'QR Code ainda não foi configurado.' }
  }
  
  const { error } = await supabase
    .from('qr_codes')
    .update({
      destination_type: destinationType,
      destination_url: destinationUrl,
    })
    .eq('id', qrId)
  
  if (error) {
    return { success: false, error: 'Erro ao atualizar destino.' }
  }
  
  return { success: true }
}
