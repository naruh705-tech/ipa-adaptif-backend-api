-- ============================================
-- Supabase Database Schema
-- Aplikasi IPA Adaptif - Backend API
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: siswa (Students)
-- ============================================
CREATE TABLE IF NOT EXISTS siswa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nim VARCHAR(50) UNIQUE NOT NULL,
  nama VARCHAR(255) NOT NULL,
  kelas VARCHAR(50) NOT NULL,
  password TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'tidak_aktif')),
  foto_profil TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Table: soal (Questions)
-- ============================================
CREATE TABLE IF NOT EXISTS soal (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  judul VARCHAR(500) NOT NULL,
  deskripsi TEXT NOT NULL,
  video_url TEXT,
  foto_url TEXT,
  guru_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Table: nilai (Grades)
-- ============================================
CREATE TABLE IF NOT EXISTS nilai (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  siswa_id UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
  soal_id TEXT,
  nilai NUMERIC(5, 2) NOT NULL CHECK (nilai >= 0 AND nilai <= 100),
  catatan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_siswa_nim ON siswa(nim);
CREATE INDEX IF NOT EXISTS idx_siswa_kelas ON siswa(kelas);
CREATE INDEX IF NOT EXISTS idx_siswa_status ON siswa(status);
CREATE INDEX IF NOT EXISTS idx_soal_guru_id ON soal(guru_id);
CREATE INDEX IF NOT EXISTS idx_nilai_siswa_id ON nilai(siswa_id);
CREATE INDEX IF NOT EXISTS idx_nilai_soal_id ON nilai(soal_id);

-- ============================================
-- Updated_at trigger function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_siswa_updated_at
  BEFORE UPDATE ON siswa
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_soal_updated_at
  BEFORE UPDATE ON soal
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Supabase Storage bucket
-- ============================================
-- Run this in the Supabase Dashboard > Storage:
-- Create a public bucket named "uploads"
-- Or via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: allow authenticated uploads
CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads');

CREATE POLICY "Allow service role upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Allow service role delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'uploads');
