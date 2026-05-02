# Dokumentasi Integrasi API untuk Android

## Base URL

```
https://ipa-adaptif-backend-api.vercel.app
```

## Format Response

Semua endpoint mengembalikan format JSON yang konsisten:

```json
{
  "success": true,
  "message": "Pesan deskriptif",
  "data": { ... }
}
```

Jika error:

```json
{
  "success": false,
  "message": "Pesan error",
  "data": null
}
```

## Dependencies Android (Gradle)

Tambahkan di `build.gradle.kts` (Module):

```kotlin
dependencies {
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    implementation("com.google.code.gson:gson:2.10.1")
}
```

---

## 1. Setup Retrofit

### ApiConfig.kt

```kotlin
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object ApiConfig {
    private const val BASE_URL = "https://ipa-adaptif-backend-api.vercel.app/"

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val client = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        .build()

    val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .addConverterFactory(GsonConverterFactory.create())
        .client(client)
        .build()

    inline fun <reified T> createService(): T = retrofit.create(T::class.java)
}
```

### AuthInterceptor.kt

```kotlin
import okhttp3.Interceptor
import okhttp3.Response

class AuthInterceptor(private val tokenProvider: () -> String?) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request().newBuilder()
        tokenProvider()?.let { token ->
            request.addHeader("Authorization", "Bearer $token")
        }
        return chain.proceed(request.build())
    }
}
```

---

## 2. Model Data

### ApiResponse.kt

```kotlin
data class ApiResponse<T>(
    val success: Boolean,
    val message: String,
    val data: T?
)
```

### LoginRequest.kt & LoginResponse.kt

```kotlin
// Guru Login
data class LoginGuruRequest(
    val nama: String,
    val password: String
)

data class LoginGuruResponse(
    val token: String,
    val guru: GuruInfo
)

data class GuruInfo(
    val id: String,
    val nama: String
)

// Siswa Login
data class LoginSiswaRequest(
    val nim: String,
    val password: String
)

data class LoginSiswaResponse(
    val token: String,
    val siswa: SiswaInfo
)
```

### Siswa.kt

```kotlin
data class SiswaInfo(
    val id: String,
    val nim: String,
    val nama: String,
    val kelas: String,
    val status: String,
    val foto_profil: String?
)

data class CreateSiswaRequest(
    val nim: String,
    val nama: String,
    val kelas: String,
    val password: String,
    val status: String = "aktif"
)

data class UpdateSiswaRequest(
    val nim: String? = null,
    val nama: String? = null,
    val kelas: String? = null,
    val password: String? = null,
    val status: String? = null
)

data class UpdateProfilRequest(
    val nama: String? = null,
    val password: String? = null,
    val foto_profil: String? = null
)

data class SiswaListResponse(
    val siswa: List<SiswaInfo>,
    val pagination: Pagination
)
```

### Soal.kt

```kotlin
data class Soal(
    val id: String,
    val judul: String,
    val deskripsi: String,
    val video_url: String?,
    val foto_url: String?,
    val guru_id: String,
    val created_at: String?,
    val updated_at: String?
)

data class CreateSoalRequest(
    val judul: String,
    val deskripsi: String,
    val video_url: String? = null,
    val foto_url: String? = null
)

data class UpdateSoalRequest(
    val judul: String? = null,
    val deskripsi: String? = null,
    val video_url: String? = null,
    val foto_url: String? = null
)

data class SoalListResponse(
    val soal: List<Soal>,
    val pagination: Pagination
)
```

### Nilai.kt

```kotlin
data class Nilai(
    val id: String,
    val siswa_id: String,
    val soal_id: String,
    val nilai: Double,
    val catatan: String?,
    val created_at: String?,
    val soal: SoalReference?
)

data class SoalReference(
    val judul: String
)

data class CreateNilaiRequest(
    val soal_id: String,
    val nilai: Double,
    val catatan: String? = null
)

data class NilaiListResponse(
    val nilai: List<Nilai>,
    val pagination: Pagination
)
```

### Pagination.kt

```kotlin
data class Pagination(
    val page: Int,
    val limit: Int,
    val total: Int?,
    val total_pages: Int
)
```

### UploadResponse.kt

```kotlin
data class UploadResponse(
    val url: String,
    val filename: String,
    val type: String,
    val original_name: String,
    val size: Long
)
```

---

## 3. API Service Interface

### ApiService.kt

```kotlin
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    // ==================== AUTH ====================

    @POST("api/auth/login-guru")
    suspend fun loginGuru(
        @Body request: LoginGuruRequest
    ): Response<ApiResponse<LoginGuruResponse>>

    @POST("api/auth/login-siswa")
    suspend fun loginSiswa(
        @Body request: LoginSiswaRequest
    ): Response<ApiResponse<LoginSiswaResponse>>

    // ==================== SISWA (Guru Only) ====================

    @GET("api/siswa")
    suspend fun getSiswaList(
        @Header("Authorization") token: String,
        @Query("kelas") kelas: String? = null,
        @Query("status") status: String? = null,
        @Query("search") search: String? = null,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<ApiResponse<SiswaListResponse>>

    @POST("api/siswa")
    suspend fun createSiswa(
        @Header("Authorization") token: String,
        @Body request: CreateSiswaRequest
    ): Response<ApiResponse<SiswaInfo>>

    @GET("api/siswa/{id}")
    suspend fun getSiswaDetail(
        @Header("Authorization") token: String,
        @Path("id") id: String
    ): Response<ApiResponse<SiswaInfo>>

    @PUT("api/siswa/{id}")
    suspend fun updateSiswa(
        @Header("Authorization") token: String,
        @Path("id") id: String,
        @Body request: UpdateSiswaRequest
    ): Response<ApiResponse<SiswaInfo>>

    @DELETE("api/siswa/{id}")
    suspend fun deleteSiswa(
        @Header("Authorization") token: String,
        @Path("id") id: String
    ): Response<ApiResponse<Nothing>>

    // ==================== PROFIL SISWA ====================

    @PATCH("api/siswa/{id}/profil")
    suspend fun updateProfil(
        @Header("Authorization") token: String,
        @Path("id") id: String,
        @Body request: UpdateProfilRequest
    ): Response<ApiResponse<SiswaInfo>>

    // ==================== NILAI ====================

    @GET("api/siswa/{id}/nilai")
    suspend fun getNilaiList(
        @Header("Authorization") token: String,
        @Path("id") siswaId: String,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<ApiResponse<NilaiListResponse>>

    @POST("api/siswa/{id}/nilai")
    suspend fun createNilai(
        @Header("Authorization") token: String,
        @Path("id") siswaId: String,
        @Body request: CreateNilaiRequest
    ): Response<ApiResponse<Nilai>>

    // ==================== SOAL (Guru Only) ====================

    @GET("api/guru/soal")
    suspend fun getSoalList(
        @Header("Authorization") token: String,
        @Query("search") search: String? = null,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<ApiResponse<SoalListResponse>>

    @POST("api/guru/soal")
    suspend fun createSoal(
        @Header("Authorization") token: String,
        @Body request: CreateSoalRequest
    ): Response<ApiResponse<Soal>>

    @GET("api/guru/soal/{id}")
    suspend fun getSoalDetail(
        @Header("Authorization") token: String,
        @Path("id") id: String
    ): Response<ApiResponse<Soal>>

    @PUT("api/guru/soal/{id}")
    suspend fun updateSoal(
        @Header("Authorization") token: String,
        @Path("id") id: String,
        @Body request: UpdateSoalRequest
    ): Response<ApiResponse<Soal>>

    @DELETE("api/guru/soal/{id}")
    suspend fun deleteSoal(
        @Header("Authorization") token: String,
        @Path("id") id: String
    ): Response<ApiResponse<Nothing>>

    // ==================== UPLOAD (Guru Only) ====================

    @Multipart
    @POST("api/upload")
    suspend fun uploadFile(
        @Header("Authorization") token: String,
        @Part file: MultipartBody.Part,
        @Part("type") type: RequestBody
    ): Response<ApiResponse<UploadResponse>>
}
```

---

## 4. Contoh Penggunaan

### Login Guru

```kotlin
val apiService = ApiConfig.createService<ApiService>()

// Login
val response = apiService.loginGuru(
    LoginGuruRequest(nama = "Admin Guru", password = "guru123")
)

if (response.isSuccessful && response.body()?.success == true) {
    val token = response.body()!!.data!!.token
    // Simpan token ke SharedPreferences
    saveToken("Bearer $token")
}
```

### List Siswa (dengan filter)

```kotlin
val token = getToken() // "Bearer eyJ..."

val response = apiService.getSiswaList(
    token = token,
    kelas = "6A",
    status = "aktif",
    page = 1
)

if (response.isSuccessful && response.body()?.success == true) {
    val siswaList = response.body()!!.data!!.siswa
    val pagination = response.body()!!.data!!.pagination
    // Update UI
}
```

### Tambah Siswa

```kotlin
val response = apiService.createSiswa(
    token = token,
    request = CreateSiswaRequest(
        nim = "2024001",
        nama = "Budi Santoso",
        kelas = "6A",
        password = "siswa123"
    )
)
```

### Tambah Soal

```kotlin
val response = apiService.createSoal(
    token = token,
    request = CreateSoalRequest(
        judul = "Manfaat Tumbuhan",
        deskripsi = "Jelaskan 3 manfaat tumbuhan bagi kehidupan sehari-hari",
        foto_url = "https://...",
        video_url = "https://..."
    )
)
```

### Upload Foto

```kotlin
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File

val file = File("/path/to/foto.jpg")
val requestFile = file.asRequestBody("image/jpeg".toMediaTypeOrNull())
val filePart = MultipartBody.Part.createFormData("file", file.name, requestFile)
val typePart = "foto".toRequestBody("text/plain".toMediaTypeOrNull())

val response = apiService.uploadFile(
    token = token,
    file = filePart,
    type = typePart
)

if (response.isSuccessful && response.body()?.success == true) {
    val uploadedUrl = response.body()!!.data!!.url
    // Gunakan URL ini untuk soal atau profil
}
```

### Login Siswa & Update Profil

```kotlin
// Login siswa
val loginResponse = apiService.loginSiswa(
    LoginSiswaRequest(nim = "2024001", password = "siswa123")
)
val siswaToken = "Bearer ${loginResponse.body()!!.data!!.token}"
val siswaId = loginResponse.body()!!.data!!.siswa.id

// Update profil sendiri
val updateResponse = apiService.updateProfil(
    token = siswaToken,
    id = siswaId,
    request = UpdateProfilRequest(
        nama = "Budi S.",
        foto_profil = "https://uploaded-foto-url.jpg"
    )
)
```

### Lihat Riwayat Nilai

```kotlin
val nilaiResponse = apiService.getNilaiList(
    token = siswaToken,
    siswaId = siswaId,
    page = 1
)

if (nilaiResponse.isSuccessful) {
    val nilaiList = nilaiResponse.body()!!.data!!.nilai
    nilaiList.forEach { nilai ->
        println("Soal: ${nilai.soal?.judul}, Nilai: ${nilai.nilai}")
    }
}
```

---

## 5. Error Handling

```kotlin
suspend fun <T> safeApiCall(call: suspend () -> Response<ApiResponse<T>>): Result<T> {
    return try {
        val response = call()
        if (response.isSuccessful && response.body()?.success == true) {
            Result.success(response.body()!!.data!!)
        } else {
            val errorMessage = response.body()?.message ?: "Unknown error"
            Result.failure(Exception(errorMessage))
        }
    } catch (e: Exception) {
        Result.failure(e)
    }
}

// Penggunaan:
val result = safeApiCall { apiService.getSiswaList(token) }
result.onSuccess { data ->
    // Handle success
}.onFailure { error ->
    // Handle error: error.message
}
```

---

## 6. HTTP Status Codes

| Code | Keterangan |
|------|------------|
| 200 | Success |
| 201 | Created (data baru berhasil dibuat) |
| 400 | Bad Request (validasi gagal) |
| 401 | Unauthorized (token tidak valid / tidak ada) |
| 403 | Forbidden (tidak punya akses) |
| 404 | Not Found |
| 409 | Conflict (NIM sudah terdaftar) |
| 500 | Internal Server Error |

---

## 7. Catatan Penting

- **Token harus selalu dikirim** dengan prefix `Bearer ` di header `Authorization`
- **Guru** bisa akses semua endpoint
- **Siswa** hanya bisa: login, lihat profil sendiri, update profil sendiri, lihat nilai sendiri
- **Upload** mendukung: foto (JPEG, PNG, GIF, WebP, max 5MB) dan video (MP4, WebM, QuickTime, max 100MB)
- **Pagination** tersedia di list endpoints dengan query parameter `page` dan `limit`
- **Search** tersedia di GET siswa (`search` param) dan GET soal (`search` param)
- **Filter** siswa bisa berdasarkan `kelas` dan `status` (aktif/tidak_aktif)

## 8. Login Guru (Static Credentials)

```
Nama: Admin Guru
Password: guru123
```
