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
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    let query = getSupabase()
      .from("soal")
      .select("*", { count: "exact" });

    if (search) {
      query = query.or(`judul.ilike.%${search}%,deskripsi.ilike.%${search}%`);
    }

    query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse({
      soal: data,
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
    const { judul, deskripsi, video_url, foto_url } = body;

    if (!judul || !deskripsi) {
      return errorResponse("Judul dan deskripsi harus diisi", 400);
    }

    const id = uuidv4();

    const { data, error } = await getSupabase()
      .from("soal")
      .insert({
        id,
        judul,
        deskripsi,
        video_url: video_url || null,
        foto_url: foto_url || null,
        guru_id: user.id,
      })
      .select("*")
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse(data, "Soal berhasil ditambahkan", 201);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
