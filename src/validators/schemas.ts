import { z } from 'zod';

// ============================================================================
// URL Validation
// ============================================================================

const BLOCKED_SCHEMES = [
  'javascript:',
  'data:',
  'file:',
  'vbscript:',
  'blob:',
  'about:',
  'ftp:',
];

export const safeUrlSchema = z
  .string()
  .min(1, 'URL é obrigatória')
  .max(2048, 'URL muito longa')
  .refine(
    (url) => {
      const lower = url.toLowerCase().trim();
      return lower.startsWith('http://') || lower.startsWith('https://');
    },
    { message: 'URL deve começar com http:// ou https://' }
  )
  .refine(
    (url) => {
      const lower = url.toLowerCase().trim();
      return !BLOCKED_SCHEMES.some((scheme) => lower.startsWith(scheme));
    },
    { message: 'Esquema de URL não permitido' }
  )
  .refine(
    (url) => {
      try {
        new URL(url.trim());
        return true;
      } catch {
        return false;
      }
    },
    { message: 'URL inválida' }
  )
  .transform((url) => url.trim());

// ============================================================================
// WhatsApp Validation
// ============================================================================

export const whatsappNumberSchema = z
  .string()
  .min(1, 'Número é obrigatório')
  .max(20, 'Número muito longo')
  .refine(
    (val) => /^\+?\d{10,15}$/.test(val.replace(/[\s\-()]/g, '')),
    { message: 'Número de WhatsApp inválido. Use o formato: +5511999999999' }
  )
  .transform((val) => val.replace(/[\s\-()]/g, ''));

export const whatsappMessageSchema = z
  .string()
  .max(500, 'Mensagem muito longa')
  .optional()
  .default('');

export const whatsappFormSchema = z.object({
  phone: whatsappNumberSchema,
  message: whatsappMessageSchema,
});

export function buildWhatsAppUrl(phone: string, message?: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const baseUrl = `https://wa.me/${cleanPhone}`;
  if (message && message.trim()) {
    return `${baseUrl}?text=${encodeURIComponent(message.trim())}`;
  }
  return baseUrl;
}

// ============================================================================
// Instagram Validation
// ============================================================================

export const instagramUsernameSchema = z
  .string()
  .min(1, 'Usuário é obrigatório')
  .max(30, 'Usuário muito longo')
  .refine(
    (val) => /^@?[a-zA-Z0-9._]{1,30}$/.test(val),
    { message: 'Usuário do Instagram inválido' }
  )
  .transform((val) => val.replace(/^@/, ''));

export function buildInstagramUrl(username: string): string {
  const clean = username.replace(/^@/, '');
  return `https://instagram.com/${clean}`;
}

// ============================================================================
// Google / Website Validation
// ============================================================================

export const googleUrlSchema = safeUrlSchema.refine(
  (url) => {
    try {
      const parsed = new URL(url);
      return parsed.hostname.includes('google') || 
             parsed.hostname.includes('goo.gl') ||
             parsed.hostname.includes('maps.app');
    } catch {
      return false;
    }
  },
  { message: 'URL deve ser um link do Google válido' }
);

export const websiteUrlSchema = safeUrlSchema;

export const customUrlSchema = safeUrlSchema;

// ============================================================================
// QR Configuration Schema
// ============================================================================

export const configureQRSchema = z.object({
  code: z.string().min(1).max(10),
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres').max(100, 'Nome muito longo'),
  destination_type: z.enum(['whatsapp', 'instagram', 'google', 'website', 'custom']),
  destination_url: safeUrlSchema,
});

// ============================================================================
// Batch Generation Schema
// ============================================================================

export const generateBatchSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  quantity: z
    .number()
    .int('Quantidade deve ser inteiro')
    .min(1, 'Mínimo 1 QR Code')
    .max(5000, 'Máximo 5000 QR Codes por lote'),
});

// ============================================================================
// Update Destination Schema
// ============================================================================

export const updateDestinationSchema = z.object({
  qr_id: z.string().uuid('ID inválido'),
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres').max(100, 'Nome muito longo'),
  destination_type: z.enum(['whatsapp', 'instagram', 'google', 'website', 'custom']),
  destination_url: safeUrlSchema,
});
