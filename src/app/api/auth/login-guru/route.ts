import { NextRequest } from "next/server";
import { GURU_CREDENTIALS } from "@/lib/types";
import { generateToken } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nama, password } = body;

    if (!nama || !password) {
      return errorResponse("Nama dan password harus diisi", 400);
    }

    const guru = GURU_CREDENTIALS.find(
      (g) => g.nama === nama && g.password === password
    );

    if (!guru) {
      return errorResponse("Nama atau password salah", 401);
    }

    const token = generateToken({
      id: guru.id,
      role: "guru",
      nama: guru.nama,
    });

    return successResponse(
      { token, guru: { id: guru.id, nama: guru.nama } },
      "Login berhasil"
    );
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
