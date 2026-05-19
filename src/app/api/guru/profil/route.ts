import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabase } from "@/lib/supabase";
import { getTokenFromHeaders } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET(request: NextRequest) {
  const user = getTokenFromHeaders(request.headers);
  if (!user || user.role !== "guru") {
    return errorResponse("Unauthorized - hanya guru yang dapat mengakses", 401);
  }

  try {
    const { data: guru, error } = await getSupabase()
      .from("guru")
      .select("id, nama, nip, sekolah, mapel, foto_profil, created_at, updated_at")
      .eq("id", user.id)
      .single();

    if (error || !guru) {
      return errorResponse("Guru tidak ditemukan", 404);
    }

    return successResponse(guru, "Profil guru berhasil diambil");
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function PATCH(request: NextRequest) {
  const user = getTokenFromHeaders(request.headers);
  if (!user || user.role !== "guru") {
    return errorResponse("Unauthorized - hanya guru yang dapat mengakses", 401);
  }

  try {
    const body = await request.json();
    const { nama, password, nip, sekolah, mapel, foto_profil } = body;

    const updateData: Record<string, string> = {};
    if (nama) updateData.nama = nama;
    if (nip !== undefined) updateData.nip = nip;
    if (sekolah !== undefined) updateData.sekolah = sekolah;
    if (mapel !== undefined) updateData.mapel = mapel;
    if (foto_profil !== undefined) updateData.foto_profil = foto_profil;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    if (Object.keys(updateData).length === 0) {
      return errorResponse("Tidak ada data yang diubah", 400);
    }

    const { data, error } = await getSupabase()
      .from("guru")
      .update(updateData)
      .eq("id", user.id)
      .select("id, nama, nip, sekolah, mapel, foto_profil, updated_at")
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    if (!data) {
      return errorResponse("Guru tidak ditemukan", 404);
    }

    return successResponse(data, "Profil guru berhasil diupdate");
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
