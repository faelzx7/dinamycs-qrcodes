-- ============================================================================
-- Seed Data for Development
-- Run this AFTER the migration in the Supabase SQL Editor
-- ============================================================================

-- NOTE: You need to create these users via Supabase Auth first (sign up),
-- then run this to update their roles and create test data.
-- Replace the UUIDs below with actual user IDs from your auth.users table.

-- After creating an admin user via the signup flow, promote them:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@example.com';

-- ============================================================================
-- Sample Batches (replace created_by with actual admin UUID)
-- ============================================================================

-- Once you have an admin user, run:
/*
INSERT INTO public.qr_batches (id, name, quantity, created_by) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'Placas Demo Outubro 2026', 10, '<ADMIN_UUID>'),
  ('b0000002-0000-0000-0000-000000000002', 'Placas Demo Novembro 2026', 5, '<ADMIN_UUID>');

-- Sample QR Codes - Unconfigured
INSERT INTO public.qr_codes (code, status, batch_id) VALUES
  ('7KX92M', 'unconfigured', 'b0000001-0000-0000-0000-000000000001'),
  ('P8Q4ZT', 'unconfigured', 'b0000001-0000-0000-0000-000000000001'),
  ('A91XKF', 'unconfigured', 'b0000001-0000-0000-0000-000000000001'),
  ('B3M7YN', 'unconfigured', 'b0000001-0000-0000-0000-000000000001'),
  ('C5R2WP', 'unconfigured', 'b0000001-0000-0000-0000-000000000001');

-- Sample QR Codes - Active (replace owner_id with actual customer UUID)
INSERT INTO public.qr_codes (code, status, destination_type, destination_url, owner_id, batch_id, configured_at) VALUES
  ('D7T9VQ', 'active', 'whatsapp', 'https://wa.me/5511999999999', '<CUSTOMER_UUID>', 'b0000001-0000-0000-0000-000000000001', now() - interval '5 days'),
  ('F2K8XS', 'active', 'instagram', 'https://instagram.com/exemplo', '<CUSTOMER_UUID>', 'b0000001-0000-0000-0000-000000000001', now() - interval '3 days'),
  ('G4L6ZU', 'active', 'website', 'https://example.com', '<CUSTOMER_UUID>', 'b0000001-0000-0000-0000-000000000001', now() - interval '1 day');

-- Sample QR Codes - Disabled
INSERT INTO public.qr_codes (code, status, destination_type, destination_url, owner_id, batch_id, configured_at) VALUES
  ('H6N3AV', 'disabled', 'whatsapp', 'https://wa.me/5511888888888', '<CUSTOMER_UUID>', 'b0000001-0000-0000-0000-000000000001', now() - interval '10 days'),
  ('J8P5BW', 'disabled', 'website', 'https://disabled-example.com', '<CUSTOMER_UUID>', 'b0000002-0000-0000-0000-000000000002', now() - interval '7 days');

-- Second batch QR Codes
INSERT INTO public.qr_codes (code, status, batch_id) VALUES
  ('K9Q7CX', 'unconfigured', 'b0000002-0000-0000-0000-000000000002'),
  ('L2R8DY', 'unconfigured', 'b0000002-0000-0000-0000-000000000002'),
  ('M4S9EZ', 'unconfigured', 'b0000002-0000-0000-0000-000000000002'),
  ('N6T2FA', 'unconfigured', 'b0000002-0000-0000-0000-000000000002'),
  ('P8U4GB', 'unconfigured', 'b0000002-0000-0000-0000-000000000002');

-- Sample Scans (reference the active QR code IDs)
-- Get the actual QR code IDs first, then insert scans:
-- INSERT INTO public.qr_scans (qr_code_id, scanned_at, device_type, country) 
-- SELECT id, now() - (random() * interval '30 days'), 
--   (ARRAY['mobile','desktop','tablet'])[floor(random()*3+1)],
--   (ARRAY['BR','US','PT'])[floor(random()*3+1)]
-- FROM public.qr_codes WHERE status = 'active'
-- CROSS JOIN generate_series(1, 20);
*/

-- ============================================================================
-- Quick Setup Instructions:
-- ============================================================================
-- 1. Sign up two users via the app (or Supabase dashboard)
-- 2. Run: UPDATE public.profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
-- 3. Replace <ADMIN_UUID> and <CUSTOMER_UUID> above with actual UUIDs
-- 4. Uncomment and run the INSERT statements above
-- ============================================================================
