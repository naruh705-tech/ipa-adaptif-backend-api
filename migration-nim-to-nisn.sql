-- ============================================
-- Migration: Rename column 'nim' to 'nisn'
-- Jalankan SQL ini di Supabase SQL Editor
-- ============================================

-- 1. Rename column
ALTER TABLE siswa RENAME COLUMN nim TO nisn;

-- 2. Drop old index dan buat baru
DROP INDEX IF EXISTS idx_siswa_nim;
CREATE INDEX IF NOT EXISTS idx_siswa_nisn ON siswa(nisn);
