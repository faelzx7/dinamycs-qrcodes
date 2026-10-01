// ============================================================================
// Database Types
// ============================================================================

export type QRStatus = 'unconfigured' | 'active' | 'disabled';

export type DestinationType = 'whatsapp' | 'instagram' | 'google' | 'website' | 'custom';

export type UserRole = 'admin' | 'customer';

// ============================================================================
// Database Row Types
// ============================================================================

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface QRCode {
  id: string;
  code: string;
  status: QRStatus;
  destination_type: DestinationType | null;
  destination_url: string | null;
  owner_id: string | null;
  batch_id: string | null;
  created_at: string;
  configured_at: string | null;
  updated_at: string;
}

export interface QRBatch {
  id: string;
  name: string;
  quantity: number;
  prefix: string | null;
  created_by: string;
  created_at: string;
}

export interface QRScan {
  id: string;
  qr_code_id: string;
  scanned_at: string;
  user_agent: string | null;
  ip_hash: string | null;
  device_type: string | null;
  country: string | null;
}

// ============================================================================
// Extended Types (with relations)
// ============================================================================

export interface QRCodeWithScans extends QRCode {
  scan_count: number;
  scans_today: number;
  scans_7_days: number;
  scans_30_days: number;
}

export interface QRCodeWithBatch extends QRCode {
  batch: QRBatch | null;
}

export interface QRBatchWithCounts extends QRBatch {
  qr_codes_count: number;
  configured_count: number;
}

// ============================================================================
// API / Form Types
// ============================================================================

export interface ConfigureQRPayload {
  code: string;
  destination_type: DestinationType;
  destination_url: string;
}

export interface GenerateBatchPayload {
  name: string;
  quantity: number;
  prefix?: string;
}

export interface UpdateQRDestinationPayload {
  qr_id: string;
  destination_type: DestinationType;
  destination_url: string;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface DailyScanCount {
  date: string;
  count: number;
}

export interface ScanStats {
  total: number;
  today: number;
  last_7_days: number;
  last_30_days: number;
}

export interface AdminStats {
  total_qr_codes: number;
  configured: number;
  unconfigured: number;
  disabled: number;
  total_scans: number;
  total_batches: number;
  scans_today: number;
  scans_7_days: number;
}

// ============================================================================
// PDF Generation Types
// ============================================================================

export interface PDFOptions {
  qr_codes: { code: string; url: string }[];
  per_page: number;
  qr_size: number;
  show_code: boolean;
  margin: number;
}
