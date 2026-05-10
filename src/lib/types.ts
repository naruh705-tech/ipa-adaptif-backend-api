export interface Siswa {
  id: string;
  nim: string;
  nama: string;
  kelas: string;
  password?: string;
  status: "aktif" | "tidak_aktif";
  foto_profil?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Guru {
  id: string;
  nama: string;
  password: string;
  nip?: string | null;
  sekolah?: string | null;
  mapel?: string | null;
  foto_profil?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Soal {
  id: string;
  judul: string;
  deskripsi: string;
  video_url?: string | null;
  foto_url?: string | null;
  guru_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Nilai {
  id: string;
  siswa_id: string;
  soal_id: string;
  nilai: number;
  catatan?: string | null;
  created_at?: string;
}

export interface UploadResult {
  url: string;
  filename: string;
  type: "video" | "foto";
}


