-- ============================================
-- Migration: Create guru table
-- Aplikasi IPA Adaptif - Backend API
-- ============================================
-- Run this in the Supabase SQL Editor

-- Table: guru (Teachers)
CREATE TABLE IF NOT EXISTS guru (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama VARCHAR(255) NOT NULL,
  password TEXT NOT NULL,
  nip VARCHAR(50),
  sekolah VARCHAR(255),
  mapel VARCHAR(100),
  foto_profil TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Disable RLS (Supabase enables RLS by default, blocking anon key access)
ALTER TABLE guru DISABLE ROW LEVEL SECURITY;

-- Index
CREATE INDEX IF NOT EXISTS idx_guru_nama ON guru(nama);

-- Updated_at trigger
CREATE TRIGGER update_guru_updated_at
  BEFORE UPDATE ON guru
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update soal table to reference guru.id (UUID) instead of varchar
-- Note: existing soal.guru_id data may need manual migration if not UUID format

-- Insert default admin guru (password: guru123, hashed with bcrypt)
-- You can generate a new hash with: SELECT crypt('guru123', gen_salt('bf', 10));
-- Or use the app to register a new guru
INSERT INTO guru (nama, password, nip, sekolah, mapel)
VALUES (
  'Admin Guru',
  '$2b$10$rILKHh0lbiXV4pHVa.bEc.40/oDJwASM8tiQvjAiJ.TOZKWpjfYEa',
  '198507152010012009',
  'SLB Negeri Harapan',
  'IPA'
)
ON CONFLICT DO NOTHING;
