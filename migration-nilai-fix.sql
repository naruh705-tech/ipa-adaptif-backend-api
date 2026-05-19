-- ============================================
-- Migration: Fix nilai table for latihan results
-- ============================================
-- This migration allows siswa to save their own
-- latihan scores without requiring a valid soal reference.
-- Run this in Supabase SQL Editor.
-- ============================================

-- 1. Remove foreign key constraint on soal_id
ALTER TABLE nilai DROP CONSTRAINT IF EXISTS nilai_soal_id_fkey;

-- 2. Change soal_id from UUID to TEXT and make it nullable
ALTER TABLE nilai ALTER COLUMN soal_id DROP NOT NULL;
ALTER TABLE nilai ALTER COLUMN soal_id TYPE TEXT USING soal_id::TEXT;
