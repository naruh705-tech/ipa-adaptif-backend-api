import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
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

    const url = request.nextUrl;
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const { data, error, count } = await getSupabase()
      .from("nilai")
      .select("id, siswa_id, soal_id, nilai, catatan, created_at", { count: "exact" })
      .eq("siswa_id", id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse({
      nilai: data,
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getTokenFromHeaders(request.headers);
  if (!user) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    const { id: siswa_id } = await params;

    if (user.role === "siswa" && user.id !== siswa_id) {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const { soal_id, nilai, catatan } = body;

    if (nilai === undefined || nilai === null) {
      return errorResponse("nilai harus diisi", 400);
    }

    if (typeof nilai !== "number" || nilai < 0 || nilai > 100) {
      return errorResponse("Nilai harus berupa angka antara 0-100", 400);
    }

    const { data: siswa } = await getSupabase()
      .from("siswa")
      .select("id")
      .eq("id", siswa_id)
      .single();

    if (!siswa) {
      return errorResponse("Siswa tidak ditemukan", 404);
    }

    const id = uuidv4();

    const { data, error } = await getSupabase()
      .from("nilai")
      .insert({
        id,
        siswa_id,
        soal_id: soal_id || null,
        nilai,
        catatan: catatan || null,
      })
      .select("id, siswa_id, soal_id, nilai, catatan, created_at")
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse(data, "Nilai berhasil ditambahkan", 201);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
