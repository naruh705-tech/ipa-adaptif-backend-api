import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabase } from "@/lib/supabase";
import { generateToken } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nama, password } = body;

    if (!nama || !password) {
      return errorResponse("Nama dan password harus diisi", 400);
    }

    const { data: guru, error } = await getSupabase()
      .from("guru")
      .select("*")
      .eq("nama", nama)
      .single();

    if (error || !guru) {
      return errorResponse("Nama atau password salah", 401);
    }

    const valid = await bcrypt.compare(password, guru.password);
    if (!valid) {
      return errorResponse("Nama atau password salah", 401);
    }

    const token = generateToken({
      id: guru.id,
      role: "guru",
      nama: guru.nama,
    });

    return successResponse(
      {
        token,
        guru: {
          id: guru.id,
          nama: guru.nama,
          nip: guru.nip,
          sekolah: guru.sekolah,
          mapel: guru.mapel,
          foto_profil: guru.foto_profil,
        },
      },
      "Login berhasil"
    );
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
