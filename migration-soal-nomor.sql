-- Migration: Add nomor column to soal table and renumber existing data
-- Run this in Supabase SQL Editor

ALTER TABLE soal ADD COLUMN IF NOT EXISTS nomor INT NOT NULL DEFAULT 0;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS rn
  FROM soal
)
UPDATE soal
SET nomor = ranked.rn
FROM ranked
WHERE soal.id = ranked.id;
