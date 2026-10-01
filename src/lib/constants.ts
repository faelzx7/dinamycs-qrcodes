export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'QR Dinâmico'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Characters for QR code generation (excluding ambiguous: I, O, 0, 1)
export const QR_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export const QR_CODE_LENGTH = 6
export const MAX_BATCH_SIZE = 5000

export const DESTINATION_TYPES = [
  { value: 'whatsapp' as const, label: 'WhatsApp', icon: 'MessageCircle', color: 'text-green-500' },
  { value: 'instagram' as const, label: 'Instagram', icon: 'Instagram', color: 'text-pink-500' },
  { value: 'google' as const, label: 'Google', icon: 'Search', color: 'text-blue-500' },
  { value: 'website' as const, label: 'Site', icon: 'Globe', color: 'text-indigo-500' },
  { value: 'custom' as const, label: 'Outro link', icon: 'Link', color: 'text-purple-500' },
] as const

export const STATUS_CONFIG = {
  unconfigured: { label: 'Não configurado', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
  active: { label: 'Ativo', color: 'bg-green-500/10 text-green-600 border-green-500/20' },
  disabled: { label: 'Desativado', color: 'bg-red-500/10 text-red-600 border-red-500/20' },
} as const
