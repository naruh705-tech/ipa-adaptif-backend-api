import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabase } from "@/lib/supabase";
import { generateToken } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nisn, password } = body;

    if (!nisn || !password) {
      return errorResponse("NISN dan password harus diisi", 400);
    }

    const { data: siswa, error } = await getSupabase()
      .from("siswa")
      .select("*")
      .eq("nisn", nisn)
      .single();

    if (error || !siswa) {
      return errorResponse("NISN atau password salah", 401);
    }

    if (siswa.status === "tidak_aktif") {
      return errorResponse("Akun tidak aktif. Hubungi guru.", 403);
    }

    const valid = await bcrypt.compare(password, siswa.password);
    if (!valid) {
      return errorResponse("NISN atau password salah", 401);
    }

    const token = generateToken({
      id: siswa.id,
      role: "siswa",
      nama: siswa.nama,
    });

    return successResponse(
      {
        token,
        siswa: {
          id: siswa.id,
          nisn: siswa.nisn,
          nama: siswa.nama,
          kelas: siswa.kelas,
          status: siswa.status,
          foto_profil: siswa.foto_profil,
        },
      },
      "Login berhasil"
    );
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
