# 📋 Permintaan Perubahan Backend — Aplikasi IPA Adaptif

> **Dibuat:** 17 Mei 2026  
> **Dari:** Tim Frontend (Mobile Android)  
> **Prioritas:** 🔴 Tinggi — Diperlukan agar fitur baru di aplikasi berjalan penuh

---

## 🎯 Latar Belakang

Saat ini, sistem **Materi** di backend menggunakan field `urutan` (angka 1–24) sebagai satu-satunya cara pengklasifikasian tingkat kesulitan materi. Pendekatan ini menyebabkan beberapa masalah:

- Nomor materi bisa duplikat jika urutan yang sama digunakan lebih dari sekali
- Tidak ada pemisahan eksplisit antara materi Mudah, Sedang, dan Sulit
- Guru tidak bisa memilih level kesulitan secara langsung saat upload materi

Kami di sisi **frontend sudah selesai diubah** mengikuti pendekatan baru berbasis field `tingkat`, **sama seperti sistem Soal yang sudah berjalan**. Kini diperlukan penyesuaian di sisi backend.

---

## 🗄️ Perubahan Database

### Tabel `materi` — Tambah Kolom Baru

```sql
ALTER TABLE materi
ADD COLUMN tingkat ENUM('mudah', 'sedang', 'sulit') NOT NULL DEFAULT 'mudah';
```

> **Catatan:** Untuk data materi yang sudah ada, lakukan migrasi otomatis berdasarkan kolom `urutan`:
> ```sql
> UPDATE materi SET tingkat = 'mudah'  WHERE urutan BETWEEN 1  AND 8;
> UPDATE materi SET tingkat = 'sedang' WHERE urutan BETWEEN 9  AND 16;
> UPDATE materi SET tingkat = 'sulit'  WHERE urutan >= 17;
> ```

---

## 🔌 Perubahan API Endpoint

### 1. `GET /api/guru/materi` — Tambah Filter `tingkat`

**Sebelumnya:**
```
GET /api/guru/materi?page=1&limit=100
```

**Sesudah:**
```
GET /api/guru/materi?tingkat=mudah&page=1&limit=100
```

| Query Param | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `tingkat` | `string` | ❌ Opsional | Filter level: `mudah` / `sedang` / `sulit`. Jika tidak dikirim → kembalikan semua. |
| `page` | `int` | ❌ Opsional | Halaman (default: 1) |
| `limit` | `int` | ❌ Opsional | Jumlah per halaman (default: 100) |

**Contoh Response (tidak berubah strukturnya):**
```json
{
  "success": true,
  "data": {
    "materi": [
      {
        "id": "abc123",
        "nama": "Pengenalan Tumbuhan",
        "deskripsi": "-",
        "manfaat": "...",
        "gambar_url": "https://...",
        "video_url": "https://...",
        "urutan": 1,
        "tingkat": "mudah",
        "guru_id": "...",
        "created_at": "2026-05-17T...",
        "updated_at": "2026-05-17T..."
      }
    ],
    "pagination": { "..." : "..." }
  }
}
```

> ⚠️ **Penting:** Field `tingkat` **harus selalu ada** di setiap objek materi pada response. Jika tidak ada, aplikasi akan menggunakan fallback `"mudah"` sebagai default.

---

### 2. `POST /api/guru/materi` — Terima Field `tingkat`

**Request Body (sebelumnya):**
```json
{
  "nama": "Pengenalan Tumbuhan",
  "deskripsi": "-",
  "manfaat": "Berguna untuk ...",
  "gambar_url": "https://...",
  "video_url": "https://...",
  "urutan": 5
}
```

**Request Body (sesudah):**
```json
{
  "nama": "Pengenalan Tumbuhan",
  "deskripsi": "-",
  "manfaat": "Berguna untuk ...",
  "gambar_url": "https://...",
  "video_url": "https://...",
  "urutan": 5,
  "tingkat": "mudah"
}
```

| Field | Tipe | Wajib | Nilai Valid | Keterangan |
|---|---|---|---|---|
| `tingkat` | `string` | ✅ Ya | `mudah`, `sedang`, `sulit` | Level kesulitan materi |

> **Catatan urutan:** Field `urutan` sekarang dihitung otomatis oleh frontend. Backend boleh menggunakan nilai ini atau menghitung ulang sendiri (misal: auto-increment per tingkat).

---

### 3. `PUT /api/guru/materi/:id` — Terima Field `tingkat`

**Request Body (sesudah):**
```json
{
  "nama": "Pengenalan Tumbuhan (Update)",
  "deskripsi": "-",
  "manfaat": "Berguna untuk ...",
  "gambar_url": "https://...",
  "video_url": "https://...",
  "tingkat": "sedang"
}
```

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `tingkat` | `string` | ❌ Opsional | Jika dikirim, update level materi. Nilai: `mudah`, `sedang`, `sulit` |

---

## 📊 Ringkasan Perubahan

| No | Komponen | Jenis Perubahan | Detail |
|---|---|---|---|
| 1 | **Database** | Tambah kolom | `tingkat ENUM('mudah','sedang','sulit') DEFAULT 'mudah'` di tabel `materi` |
| 2 | **Database** | Migrasi data | Set `tingkat` berdasarkan nilai `urutan` lama (1-8=mudah, 9-16=sedang, 17+=sulit) |
| 3 | **GET /api/guru/materi** | Tambah query param | `?tingkat=mudah/sedang/sulit` (opsional) |
| 4 | **POST /api/guru/materi** | Tambah field body | `tingkat: string` (wajib) |
| 5 | **PUT /api/guru/materi/:id** | Tambah field body | `tingkat: string` (opsional) |
| 6 | **Response semua endpoint materi** | Tambah field | Sertakan `"tingkat"` di setiap objek materi di response |

---

## ✅ Checklist Verifikasi Backend

Setelah perubahan selesai, mohon pastikan:

- [ ] `GET /api/guru/materi` tanpa `?tingkat` → mengembalikan **semua** materi
- [ ] `GET /api/guru/materi?tingkat=mudah` → hanya materi dengan `tingkat = 'mudah'`
- [ ] `GET /api/guru/materi?tingkat=sedang` → hanya materi dengan `tingkat = 'sedang'`
- [ ] `GET /api/guru/materi?tingkat=sulit` → hanya materi dengan `tingkat = 'sulit'`
- [ ] `POST /api/guru/materi` dengan `{ "tingkat": "sedang" }` → tersimpan dengan benar
- [ ] `PUT /api/guru/materi/:id` dengan `{ "tingkat": "sulit" }` → berhasil diperbarui
- [ ] Setiap objek materi di response **selalu punya field `"tingkat"`** (tidak null/missing)
- [ ] Data materi lama berhasil dimigrasi ke kolom `tingkat`

---

## 🔗 Referensi — Sistem Soal (Yang Sudah Berjalan)

Perubahan ini **mengikuti pola yang sama** dengan endpoint Soal yang sudah ada:

```
GET  /api/guru/soal?tingkat=mudah            ← Sudah berjalan ✅
POST /api/guru/soal  { "tingkat": "mudah" }  ← Sudah berjalan ✅
PUT  /api/guru/soal/:id { "tingkat": ... }   ← Sudah berjalan ✅
```

Cukup terapkan logika **yang sama persis** untuk endpoint **Materi**.

---

> 📄 File ini dibuat otomatis oleh sistem frontend pada **17 Mei 2026**.
