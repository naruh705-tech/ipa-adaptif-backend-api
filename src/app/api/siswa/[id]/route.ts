import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabase } from "@/lib/supabase";
import { getTokenFromHeaders } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getTokenFromHeaders(request.headers);
  if (!user) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    const { id } = await params;

    if (user.role === "siswa" && user.id !== id) {
      return errorResponse("Forbidden", 403);
    }

    const { data, error } = await getSupabase()
      .from("siswa")
      .select("id, nim, nama, kelas, status, foto_profil, created_at, updated_at")
      .eq("id", id)
      .single();

    if (error || !data) {
      return errorResponse("Siswa tidak ditemukan", 404);
    }

    return successResponse(data);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getTokenFromHeaders(request.headers);
  if (!user || user.role !== "guru") {
    return errorResponse("Unauthorized - hanya guru yang dapat mengakses", 401);
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { nim, nama, kelas, password, status } = body;

    const updateData: Record<string, string> = {};
    if (nim) updateData.nim = nim;
    if (nama) updateData.nama = nama;
    if (kelas) updateData.kelas = kelas;
    if (status) updateData.status = status;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    if (Object.keys(updateData).length === 0) {
      return errorResponse("Tidak ada data yang diubah", 400);
    }

    const { data, error } = await getSupabase()
      .from("siswa")
      .update(updateData)
      .eq("id", id)
      .select("id, nim, nama, kelas, status, foto_profil, created_at, updated_at")
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    if (!data) {
      return errorResponse("Siswa tidak ditemukan", 404);
    }

    return successResponse(data, "Siswa berhasil diupdate");
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getTokenFromHeaders(request.headers);
  if (!user || user.role !== "guru") {
    return errorResponse("Unauthorized - hanya guru yang dapat mengakses", 401);
  }

  try {
    const { id } = await params;

    const { error } = await getSupabase().from("siswa").delete().eq("id", id);

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse(null, "Siswa berhasil dihapus");
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
