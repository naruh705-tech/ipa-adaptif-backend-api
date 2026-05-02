import { NextRequest } from "next/server";
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

    const { data, error } = await getSupabase()
      .from("soal")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return errorResponse("Soal tidak ditemukan", 404);
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
    const { judul, deskripsi, video_url, foto_url } = body;

    const updateData: Record<string, string | null> = {};
    if (judul !== undefined) updateData.judul = judul;
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi;
    if (video_url !== undefined) updateData.video_url = video_url;
    if (foto_url !== undefined) updateData.foto_url = foto_url;

    if (Object.keys(updateData).length === 0) {
      return errorResponse("Tidak ada data yang diubah", 400);
    }

    const { data, error } = await getSupabase()
      .from("soal")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    if (!data) {
      return errorResponse("Soal tidak ditemukan", 404);
    }

    return successResponse(data, "Soal berhasil diupdate");
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

    const { error } = await getSupabase().from("soal").delete().eq("id", id);

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse(null, "Soal berhasil dihapus");
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
