-- ============================================================================
-- QR Codes Dinâmicos - Adicionar coluna de Nome
-- Run this in the Supabase SQL Editor AFTER 001_initial_schema.sql
-- ============================================================================

ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS name TEXT;
