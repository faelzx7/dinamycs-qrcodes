-- ============================================================================
-- QR Codes Dinâmicos - Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. Profiles Table (extends auth.users)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 2. QR Batches Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.qr_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0 AND quantity <= 5000),
  prefix TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 3. QR Codes Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'unconfigured' CHECK (status IN ('unconfigured', 'active', 'disabled')),
  destination_type TEXT CHECK (
    destination_type IS NULL OR destination_type IN ('whatsapp', 'instagram', 'google', 'website', 'custom')
  ),
  destination_url TEXT,
  owner_id UUID REFERENCES public.profiles(id),
  batch_id UUID REFERENCES public.qr_batches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  configured_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Business rules: configured QR must have URL and type
  CONSTRAINT valid_configured_qr CHECK (
    (status = 'unconfigured' AND destination_url IS NULL AND destination_type IS NULL)
    OR
    (status IN ('active', 'disabled') AND destination_url IS NOT NULL AND destination_type IS NOT NULL)
  )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_qr_codes_code ON public.qr_codes(code);
CREATE INDEX IF NOT EXISTS idx_qr_codes_owner ON public.qr_codes(owner_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_batch ON public.qr_codes(batch_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_status ON public.qr_codes(status);

-- ============================================================================
-- 4. QR Scans Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.qr_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_agent TEXT,
  ip_hash TEXT,
  device_type TEXT,
  country TEXT
);

CREATE INDEX IF NOT EXISTS idx_qr_scans_qr_code ON public.qr_scans(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_date ON public.qr_scans(scanned_at);

-- ============================================================================
-- 5. Helper function: check if user is admin
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- 6. Updated_at trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_qr_codes_updated_at
  BEFORE UPDATE ON public.qr_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- 7. Row Level Security Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Profiles Policies
-- ---------------------------------------------------------------------------

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Users can update own profile (not role)"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- ---------------------------------------------------------------------------
-- QR Codes Policies
-- ---------------------------------------------------------------------------

-- Customers see only their own configured QR codes
CREATE POLICY "Customers can view own QR codes"
  ON public.qr_codes FOR SELECT
  USING (owner_id = auth.uid());

-- Admins see all
CREATE POLICY "Admins can view all QR codes"
  ON public.qr_codes FOR SELECT
  USING (public.is_admin());

-- Allow reading unconfigured QR codes by code (for the config wizard - public access)
CREATE POLICY "Anyone can view unconfigured QR codes by code"
  ON public.qr_codes FOR SELECT
  USING (status = 'unconfigured');

-- Customers can update their own QR codes (destination only)
CREATE POLICY "Customers can update own QR codes"
  ON public.qr_codes FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Admins can insert (batch generation)
CREATE POLICY "Admins can insert QR codes"
  ON public.qr_codes FOR INSERT
  WITH CHECK (public.is_admin());

-- Admins can update any QR code
CREATE POLICY "Admins can update any QR code"
  ON public.qr_codes FOR UPDATE
  USING (public.is_admin());

-- Admins can delete QR codes
CREATE POLICY "Admins can delete QR codes"
  ON public.qr_codes FOR DELETE
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- QR Batches Policies (Admin only)
-- ---------------------------------------------------------------------------

CREATE POLICY "Admins can view all batches"
  ON public.qr_batches FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can create batches"
  ON public.qr_batches FOR INSERT
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- QR Scans Policies
-- ---------------------------------------------------------------------------

-- Admins see all scans
CREATE POLICY "Admins can view all scans"
  ON public.qr_scans FOR SELECT
  USING (public.is_admin());

-- Customers see scans of their own QR codes
CREATE POLICY "Customers can view own QR scans"
  ON public.qr_scans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.qr_codes
      WHERE qr_codes.id = qr_scans.qr_code_id
      AND qr_codes.owner_id = auth.uid()
    )
  );

-- Scans are inserted via service role (server-side only)
-- No INSERT policy for authenticated users - only service role can insert scans
