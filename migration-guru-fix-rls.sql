-- ============================================
-- Fix: Disable RLS on guru table
-- ============================================
-- Supabase enables RLS by default on new tables.
-- Since we use the anon key, we need to either disable RLS
-- or add policies. Disabling RLS matches the behavior of
-- the siswa, soal, and nilai tables.

ALTER TABLE guru DISABLE ROW LEVEL SECURITY;

-- Also disable RLS on siswa, soal, nilai if not already disabled
ALTER TABLE siswa DISABLE ROW LEVEL SECURITY;
ALTER TABLE soal DISABLE ROW LEVEL SECURITY;
ALTER TABLE nilai DISABLE ROW LEVEL SECURITY;
