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
      .from("materi")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return errorResponse("Materi tidak ditemukan", 404);
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
    const { nama, deskripsi, manfaat, gambar_url, urutan } = body;

    const updateData: Record<string, unknown> = {};
    if (nama !== undefined) updateData.nama = nama;
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi;
    if (manfaat !== undefined) updateData.manfaat = manfaat;
    if (gambar_url !== undefined) updateData.gambar_url = gambar_url;
    if (urutan !== undefined) updateData.urutan = urutan;

    const { data, error } = await getSupabase()
      .from("materi")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    if (!data) {
      return errorResponse("Materi tidak ditemukan", 404);
    }

    return successResponse(data, "Materi berhasil diperbarui");
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
    const { error } = await getSupabase()
      .from("materi")
      .delete()
      .eq("id", id);

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse(null, "Materi berhasil dihapus");
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
