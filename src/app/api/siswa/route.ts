import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { getSupabase } from "@/lib/supabase";
import { getTokenFromHeaders } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET(request: NextRequest) {
  const user = getTokenFromHeaders(request.headers);
  if (!user || user.role !== "guru") {
    return errorResponse("Unauthorized - hanya guru yang dapat mengakses", 401);
  }

  try {
    const url = request.nextUrl;
    const kelas = url.searchParams.get("kelas");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    let query = getSupabase()
      .from("siswa")
      .select("id, nim, nama, kelas, status, foto_profil, created_at, updated_at", { count: "exact" });

    if (kelas) query = query.eq("kelas", kelas);
    if (status) query = query.eq("status", status);
    if (search) query = query.or(`nama.ilike.%${search}%,nim.ilike.%${search}%`);

    query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse({
      siswa: data,
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
    const { nim, nama, kelas, password, status } = body;

    if (!nim || !nama || !kelas || !password) {
      return errorResponse("NIM, nama, kelas, dan password harus diisi", 400);
    }

    const { data: existing } = await getSupabase()
      .from("siswa")
      .select("id")
      .eq("nim", nim)
      .single();

    if (existing) {
      return errorResponse("NIM sudah terdaftar", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    const { data, error } = await getSupabase()
      .from("siswa")
      .insert({
        id,
        nim,
        nama,
        kelas,
        password: hashedPassword,
        status: status || "aktif",
      })
      .select("id, nim, nama, kelas, status, foto_profil, created_at")
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse(data, "Siswa berhasil ditambahkan", 201);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
