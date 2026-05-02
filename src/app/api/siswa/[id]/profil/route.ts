import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabase } from "@/lib/supabase";
import { getTokenFromHeaders } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/response";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getTokenFromHeaders(request.headers);
  if (!user || user.role !== "siswa") {
    return errorResponse("Unauthorized - hanya siswa yang dapat mengakses", 401);
  }

  try {
    const { id } = await params;

    if (user.id !== id) {
      return errorResponse("Forbidden - hanya bisa mengubah profil sendiri", 403);
    }

    const body = await request.json();
    const { nama, password, foto_profil } = body;

    const updateData: Record<string, string> = {};
    if (nama) updateData.nama = nama;
    if (foto_profil) updateData.foto_profil = foto_profil;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    if (Object.keys(updateData).length === 0) {
      return errorResponse("Tidak ada data yang diubah", 400);
    }

    const { data, error } = await getSupabase()
      .from("siswa")
      .update(updateData)
      .eq("id", id)
      .select("id, nim, nama, kelas, status, foto_profil, updated_at")
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    if (!data) {
      return errorResponse("Siswa tidak ditemukan", 404);
    }

    return successResponse(data, "Profil berhasil diupdate");
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
