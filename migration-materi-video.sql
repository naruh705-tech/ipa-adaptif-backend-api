-- ============================================
-- Migration: Tambah kolom video_url di tabel materi
-- ============================================

ALTER TABLE materi ADD COLUMN IF NOT EXISTS video_url TEXT;
