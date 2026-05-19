-- Migration: Add tingkat column to soal table
-- Run this in Supabase SQL Editor

-- Add tingkat column with default 'pretest'
ALTER TABLE soal ADD COLUMN IF NOT EXISTS tingkat TEXT NOT NULL DEFAULT 'pretest';

-- Update existing soal to have 'pretest' as default tingkat
UPDATE soal SET tingkat = 'pretest' WHERE tingkat IS NULL OR tingkat = '';
