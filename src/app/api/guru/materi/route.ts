import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getSupabase } from "@/lib/supabase";
import { getTokenFromHeaders } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET(request: NextRequest) {
  const user = getTokenFromHeaders(request.headers);
  if (!user) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    const url = request.nextUrl;
    const search = url.searchParams.get("search");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    let query = getSupabase()
      .from("materi")
      .select("*", { count: "exact" });

    if (search) {
      query = query.or(`nama.ilike.%${search}%,deskripsi.ilike.%${search}%`);
    }

    query = query.order("urutan", { ascending: true }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse({
      materi: data,
      pagination: {
        page,
        limit,
        total: count,
        total_pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  const user = getTokenFromHeaders(request.headers);
  if (!user || user.role !== "guru") {
    return errorResponse("Unauthorized - hanya guru yang dapat mengakses", 401);
  }

  try {
    const body = await request.json();
    const { nama, deskripsi, manfaat, gambar_url, video_url, urutan } = body;

    if (!nama || !deskripsi || !manfaat) {
      return errorResponse("Nama, deskripsi, dan manfaat harus diisi", 400);
    }

    const id = uuidv4();

    const { data, error } = await getSupabase()
      .from("materi")
      .insert({
        id,
        nama,
        deskripsi,
        manfaat,
        gambar_url: gambar_url || null,
        video_url: video_url || null,
        urutan: urutan || 0,
        guru_id: user.id,
      })
      .select("*")
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse(data, "Materi berhasil ditambahkan", 201);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
