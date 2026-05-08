-- Migration: Create materi table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS materi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  deskripsi TEXT NOT NULL,
  manfaat TEXT NOT NULL,
  gambar_url TEXT,
  urutan INTEGER DEFAULT 0,
  guru_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE materi ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated operations via service key (API handles auth)
CREATE POLICY "Allow all operations on materi" ON materi
  FOR ALL USING (true) WITH CHECK (true);

-- Insert default materi data
INSERT INTO materi (id, nama, deskripsi, manfaat, gambar_url, urutan, guru_id) VALUES
  (gen_random_uuid(), 'Apa Itu Tumbuhan?', 'Mengenal tumbuhan dan bagian-bagiannya', 'Tumbuhan adalah makhluk hidup.

Tumbuhan bisa hidup di darat dan di air.

Tumbuhan memiliki bagian-bagian, seperti: akar, batang, dan daun.

Tumbuhan biasanya berwarna hijau.

Nama-Nama Bagian Tumbuhan:
- Akar — bagian yang ada di dalam tanah
- Batang — bagian yang tegak
- Daun — bagian yang berwarna hijau
- Bunga — bagian yang berwarna-warni
- Buah — bagian yang bisa dimakan', NULL, 1, 'guru'),

  (gen_random_uuid(), 'Bahan Makanan', 'Tumbuhan sebagai bahan makanan', 'Manfaat Tumbuhan untuk Manusia

1. Sebagai Bahan Makanan

- Padi → bijinya untuk dimasak jadi nasi
- Pisang → buahnya untuk dimakan
- Singkong → umbinya untuk direbus/digoreng
- Jagung → bijinya bisa dibuat tepung', NULL, 2, 'guru'),

  (gen_random_uuid(), 'Bahan Obat', 'Tumbuhan sebagai bahan obat', '2. Sebagai Bahan Obat

- Jahe → untuk obat masuk angin
- Kunyit → untuk obat luka
- Lidah buaya → untuk obat luka bakar
- Daun sirih → untuk obat sariawan', NULL, 3, 'guru'),

  (gen_random_uuid(), 'Bahan Bangunan', 'Tumbuhan sebagai bahan bangunan', '3. Sebagai Bahan Bangunan

- Jati → kayunya untuk membuat rumah dan meja kursi
- Bambu → batangnya untuk membuat pagar', NULL, 4, 'guru'),

  (gen_random_uuid(), 'Bahan Sandang', 'Tumbuhan sebagai bahan sandang/pakaian', '4. Sebagai Bahan Sandang

- Kapas → untuk dibuat menjadi benang dan kain
- Pandan → daunnya untuk dianyam menjadi tas/tikar', NULL, 5, 'guru'),

  (gen_random_uuid(), 'Pewarna Alami', 'Tumbuhan sebagai pewarna alami', '5. Sebagai Pewarna Alami

- Kunyit → menghasilkan warna kuning
- Buah naga → menghasilkan warna merah
- Wortel → menghasilkan warna oren', NULL, 6, 'guru'),

  (gen_random_uuid(), 'Bahan Industri', 'Tumbuhan sebagai bahan industri', '6. Sebagai Bahan Industri

- Kelapa sawit → dibuat menjadi minyak goreng
- Pohon karet → getahnya dibuat menjadi ban mobil/motor', NULL, 7, 'guru'),

  (gen_random_uuid(), 'Pohon Kelapa', 'Contoh khusus tumbuhan yang sangat bermanfaat', 'Contoh Khusus: Pohon Kelapa

Mari kita pelajari satu contoh tumbuhan yang sangat bermanfaat: Pohon Kelapa

Bagian-bagian Pohon Kelapa:
1. Buah Kelapa
2. Batang Kelapa
3. Daun Kelapa

Manfaat Buah Kelapa:
- Air kelapa → diminum sebagai minuman segar
- Daging kelapa → dibuat santan untuk masak
- Tempurung kelapa → dibuat gelas, mangkuk, dan hiasan

Manfaat Batang Kelapa:
- Kayu kelapa → dibuat meja, dan kursi

Manfaat Daun Kelapa:
- Lidi → dibuat sapu
- Daun muda → dibuat ketupat', NULL, 8, 'guru');
