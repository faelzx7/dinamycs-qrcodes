import crypto from 'crypto'

const QR_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const QR_CODE_LENGTH = 6

export function generateUniqueCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(QR_CODE_LENGTH))
  return Array.from(bytes)
    .map((b) => QR_CODE_CHARS[b % QR_CODE_CHARS.length])
    .join('')
}

export function generateUniqueCodes(quantity: number): string[] {
  const codes = new Set<string>()
  let attempts = 0
  const maxAttempts = quantity * 3
  
  while (codes.size < quantity && attempts < maxAttempts) {
    codes.add(generateUniqueCode())
    attempts++
  }
  
  if (codes.size < quantity) {
    throw new Error(`Failed to generate ${quantity} unique codes after ${maxAttempts} attempts`)
  }
  
  return Array.from(codes)
}
