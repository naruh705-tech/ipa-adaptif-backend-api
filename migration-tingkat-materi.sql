-- Migration: Add tingkat column to materi table
-- Run this in Supabase SQL Editor

-- Step 1: Add tingkat column with default 'mudah'
ALTER TABLE materi
ADD COLUMN IF NOT EXISTS tingkat TEXT NOT NULL DEFAULT 'mudah';

-- Step 2: Migrate existing data based on urutan column
-- urutan 1–8   → mudah
-- urutan 9–16  → sedang
-- urutan 17+   → sulit
UPDATE materi SET tingkat = 'mudah'  WHERE urutan BETWEEN 1 AND 8;
UPDATE materi SET tingkat = 'sedang' WHERE urutan BETWEEN 9 AND 16;
UPDATE materi SET tingkat = 'sulit'  WHERE urutan >= 17;

-- Step 3: (Optional) Add a CHECK constraint to validate values
-- ALTER TABLE materi ADD CONSTRAINT materi_tingkat_check
--   CHECK (tingkat IN ('mudah', 'sedang', 'sulit'));
