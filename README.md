# Backend API - Aplikasi IPA Adaptif

Backend API menggunakan **Next.js 16** (App Router) dengan **Supabase** sebagai database dan storage.

## Tech Stack

- **Next.js 16** (TypeScript, App Router)
- **Supabase** (PostgreSQL database + Storage untuk upload file)
- **JWT** untuk autentikasi
- **bcryptjs** untuk hashing password

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Konfigurasi Environment

Copy file `.env.example` ke `.env.local`:

```bash
cp .env.example .env.local
```

Isi dengan konfigurasi Supabase kamu:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
```

### 3. Setup Database

Jalankan SQL di file `supabase-schema.sql` di Supabase SQL Editor untuk membuat tabel-tabel yang diperlukan.

### 4. Setup Storage

Buat bucket `uploads` di Supabase Storage (sudah termasuk di schema SQL).

### 5. Jalankan Server

```bash
npm run dev
```

Server berjalan di `http://localhost:3000`.

## API Endpoints

### Auth

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/login-guru` | Login guru (static credentials) |
| POST | `/api/auth/login-siswa` | Login siswa dengan NIM & password |

### Siswa (Guru Only - CRUD)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/siswa` | Daftar semua siswa (filter: kelas, status, search) |
| POST | `/api/siswa` | Tambah siswa baru |
| GET | `/api/siswa/[id]` | Detail siswa |
| PUT | `/api/siswa/[id]` | Update siswa |
| DELETE | `/api/siswa/[id]` | Hapus siswa |

### Profil Siswa (Siswa Only)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| PATCH | `/api/siswa/[id]/profil` | Update profil sendiri (nama, password, foto) |

### Nilai (Riwayat Nilai)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/siswa/[id]/nilai` | Riwayat nilai siswa |
| POST | `/api/siswa/[id]/nilai` | Tambah nilai (guru atau siswa sendiri) |

### Soal (Guru Only - CRUD)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/guru/soal` | Daftar semua soal |
| POST | `/api/guru/soal` | Tambah soal baru |
| GET | `/api/guru/soal/[id]` | Detail soal |
| PUT | `/api/guru/soal/[id]` | Update soal |
| DELETE | `/api/guru/soal/[id]` | Hapus soal |

### Upload (Guru Only)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/upload` | Upload foto atau video |

## Login Guru (Static)

```json
{
  "nama": "Admin Guru",
  "password": "guru123"
}
```

## Contoh Request

### Login Guru

```bash
curl -X POST http://localhost:3000/api/auth/login-guru \
  -H "Content-Type: application/json" \
  -d '{"nama": "Admin Guru", "password": "guru123"}'
```

### Tambah Siswa

```bash
curl -X POST http://localhost:3000/api/siswa \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"nim": "2024001", "nama": "Budi", "kelas": "6A", "password": "siswa123"}'
```

### Upload Foto

```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@foto.jpg" \
  -F "type=foto"
```

### Tambah Soal

```bash
curl -X POST http://localhost:3000/api/guru/soal \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"judul": "Manfaat Tumbuhan", "deskripsi": "Jelaskan manfaat tumbuhan bagi kehidupan", "foto_url": "https://...", "video_url": "https://..."}'
```
