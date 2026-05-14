# 📋 Perubahan Backend: Sistem Penomoran Soal yang Stabil

**Status**: ✅ Deploy ke Vercel selesai  
**Tanggal**: 14 Mei 2026  
**Deployment URL**: https://ipa-adaptif-backend-api.vercel.app

---

## 📝 Ringkasan Perubahan

Backend telah diperbarui untuk menggunakan sistem penomoran soal yang **permanent, stabil, dan auto-renumber**. Tidak lagi menggunakan adapter position.

### Perubahan di Backend

1. **Tambah Field `nomor` ke Model Soal**
   - Setiap soal sekarang punya field `nomor: Int`
   - Nomor bersifat permanent dan stabil di database
   - Tidak berubah walaupun list difilter, dicari, atau di-refresh

2. **Database Migration**
   - Kolom `nomor INT NOT NULL DEFAULT 0` sudah ditambahkan ke tabel `soal`
   - Data existing sudah di-renumber berdasarkan `ROW_NUMBER() OVER (ORDER BY created_at)`

3. **API GET Soal** (`/api/guru/soal`)
   - Response sekarang include field `nomor`
   - Data sudah terurut `ORDER BY nomor ASC`
   - Contoh response:
     ```json
     {
       "soal": [
         {
           "id": "uuid-1",
           "judul": "Soal Photosynthesis",
           "nomor": 1,
           "deskripsi": "..."
         },
         {
           "id": "uuid-2",
           "judul": "Soal Respiration",
           "nomor": 2,
           "deskripsi": "..."
         }
       ]
     }
     ```

4. **API POST Soal (Create)** (`/api/guru/soal`)
   - Nomor otomatis di-set: `nomor = max(nomor) + 1`
   - Frontend tidak perlu menghitung atau mengirim nomor
   - Contoh: jika soal terakhir punya nomor 5, soal baru akan nomor 6

5. **API DELETE Soal** (`/api/guru/soal/:id`)
   - Setelah soal dihapus, semua soal dengan nomor lebih besar otomatis di-renumber
   - **Contoh**:
     - Sebelum: Soal 1, 2, 3, 4, 5
     - Hapus soal nomor 3
     - Sesudah: Soal 1, 2, 3, 4 (nomor 4 dan 5 otomatis berkurang)
   - Tidak ada celah nomor

---

## 🔧 Yang Perlu Diubah di Frontend (Android)

### 1. Update Adapter (Penting!)

**❌ JANGAN gunakan ini lagi:**
```kotlin
holder.tvNomor.text = (position + 1).toString()
```

**✅ GUNAKAN ini:**
```kotlin
holder.tvNomor.text = item.nomor.toString()
```

### 2. Update Model Soal

Pastikan model `Soal` di Android sudah punya field:
```kotlin
data class Soal(
    val id: String,
    val judul: String,
    val deskripsi: String,
    val nomor: Int,  // ← Tambahkan field ini
    val video_url: String? = null,
    val foto_url: String? = null,
    // ... field lainnya
)
```

### 3. RecyclerView & List

- **Sorting**: Jangan urutkan manual, data dari API sudah `ORDER BY nomor ASC`
- **Filtering**: Saat filter atau search, tetap tampilkan nomor asli dari database
- **Pagination**: Nomor tetap konsisten di setiap halaman

### 4. Dialog & Detail Soal

- Gunakan `item.nomor` untuk menampilkan nomor soal
- Jangan gunakan posisi atau index

### 5. Create Soal

**Saat create**, backend otomatis assign nomor:
```kotlin
// Request (nomor TIDAK perlu dikirim)
val body = mapOf(
    "judul" to "Soal Baru",
    "deskripsi" to "Jawaban A, B, C, D",
    "video_url" to "...",
    // nomor tidak perlu
)

// Response akan include nomor yang sudah diassign oleh backend
val response = api.createSoal(body)
val nomorBaru = response.soal.nomor  // ← Ambil dari response
```

### 6. Delete Soal

**Saat delete**, backend otomatis renumber:
```kotlin
// Cukup delete dengan ID
api.deleteSoal(soalId)

// Refresh list
val updatedList = api.getAllSoal()  // ← Nomor sudah benar otomatis
```

### 7. Toast & Dialog Messages

Update pesan supaya gunakan `nomor` dari object:
```kotlin
Toast.makeText(context, "Soal nomor ${soal.nomor} berhasil dihapus", Toast.LENGTH_SHORT).show()

// Dialog
alertDialog.setMessage("Hapus soal nomor ${soal.nomor}?")
```

---

## ✅ Checklist untuk Frontend

- [ ] Update adapter gunakan `item.nomor` bukan `position + 1`
- [ ] Tambahkan field `nomor: Int` ke model Soal Android
- [ ] Pastikan sorting data berdasarkan `nomor` ASC (jangan urutkan manual)
- [ ] Update detail soal & dialog tampilkan `nomor`
- [ ] Test create soal → verifikasi nomor auto-increment
- [ ] Test delete soal → verifikasi nomor lain otomatis berkurang
- [ ] Test refresh/filter → verifikasi nomor tetap konsisten
- [ ] Update toast/message gunakan `nomor` dari object
- [ ] Test pagination (jika ada) → nomor tetap benar

---

## 📡 API Endpoints

### GET `/api/guru/soal`
**Response**:
```json
{
  "soal": [
    {
      "id": "uuid",
      "judul": "string",
      "deskripsi": "string",
      "video_url": "string | null",
      "foto_url": "string | null",
      "guru_id": "string",
      "nomor": 1,
      "created_at": "ISO timestamp",
      "updated_at": "ISO timestamp"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "total_pages": 1
  }
}
```

### POST `/api/guru/soal`
**Request**:
```json
{
  "judul": "Soal Baru",
  "deskripsi": "Jawaban A, B, C, D",
  "video_url": "...",
  "foto_url": "...",
  "tingkat": "pretest"
}
```

**Response** (nomor sudah diset oleh backend):
```json
{
  "id": "uuid",
  "judul": "Soal Baru",
  "deskripsi": "...",
  "nomor": 6,
  ...
}
```

### DELETE `/api/guru/soal/:id`
**Response**:
```json
{
  "message": "Soal berhasil dihapus"
}
```

---

## 🔗 File yang Diubah di Backend

- `src/lib/types.ts` - Tambah field `nomor` ke interface `Soal`
- `src/app/api/guru/soal/route.ts` - Update GET & POST dengan logika nomor
- `src/app/api/guru/soal/[id]/route.ts` - Update DELETE dengan auto-renumber
- `supabase-schema.sql` - Dokumentasi schema terbaru
- `migration-soal-nomor.sql` - Migration script untuk Supabase

---

## 🚀 Testing & Validasi

1. **Cek API Response**:
   - Buka endpoint: `GET /api/guru/soal`
   - Verifikasi response include field `nomor`
   - Verifikasi urutan `nomor` adalah 1, 2, 3, dst

2. **Test Create**:
   - Create soal baru via `POST /api/guru/soal`
   - Verifikasi nomor yang diterima = nomor terakhir + 1

3. **Test Delete**:
   - Delete soal nomor 3 (dari 1, 2, 3, 4, 5)
   - Refresh list → verifikasi hasilnya 1, 2, 3, 4 (tidak ada 5)

4. **Test Renumber**:
   - Pastikan tidak ada nomor kosong setelah delete
   - Pastikan nomor konsisten setelah refresh

---

## 📞 Support & Questions

Jika ada pertanyaan atau ada issue saat integrasi:
- Cek response API di Postman/Insomnia
- Verifikasi field `nomor` ada di response
- Pastikan migration Supabase sudah dijalankan

---

**Last Updated**: 14 Mei 2026  
**Backend Version**: Deployed to Vercel
