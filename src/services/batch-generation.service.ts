import { createAdminClient } from '@/lib/supabase/admin'
import { generateUniqueCodes } from './qr-generation.service'

export async function createBatch(
  name: string,
  quantity: number,
  createdBy: string
): Promise<{ success: boolean; batchId?: string; error?: string }> {
  const supabase = createAdminClient()
  
  // Generate unique codes
  const codes = generateUniqueCodes(quantity)
  
  // Verify no collisions with existing codes
  const { data: existing } = await supabase
    .from('qr_codes')
    .select('code')
    .in('code', codes)
  
  if (existing && existing.length > 0) {
    // Regenerate colliding codes
    const existingCodes = new Set(existing.map(e => e.code))
    const cleanCodes = codes.filter(c => !existingCodes.has(c))
    const needed = quantity - cleanCodes.length
    
    if (needed > 0) {
      const extraCodes = generateUniqueCodes(needed * 2)
      for (const code of extraCodes) {
        if (cleanCodes.length >= quantity) break
        if (!existingCodes.has(code)) cleanCodes.push(code)
      }
    }
    
    if (cleanCodes.length < quantity) {
      return { success: false, error: 'Não foi possível gerar códigos únicos suficientes.' }
    }
    
    codes.length = 0
    codes.push(...cleanCodes.slice(0, quantity))
  }
  
  // Create the batch
  const { data: batch, error: batchError } = await supabase
    .from('qr_batches')
    .insert({ name, quantity, created_by: createdBy })
    .select()
    .single()
  
  if (batchError || !batch) {
    return { success: false, error: 'Erro ao criar lote.' }
  }
  
  // Insert QR codes in chunks of 500
  const chunkSize = 500
  for (let i = 0; i < codes.length; i += chunkSize) {
    const chunk = codes.slice(i, i + chunkSize)
    const qrRecords = chunk.map(code => ({
      code,
      status: 'unconfigured' as const,
      batch_id: batch.id,
    }))
    
    const { error: insertError } = await supabase
      .from('qr_codes')
      .insert(qrRecords)
    
    if (insertError) {
      // Cleanup: delete the batch if insertion fails
      await supabase.from('qr_batches').delete().eq('id', batch.id)
      return { success: false, error: `Erro ao inserir QR Codes: ${insertError.message}` }
    }
  }
  
  return { success: true, batchId: batch.id }
}
