import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getSupabase } from "@/lib/supabase";
import { getTokenFromHeaders } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/response";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

export async function POST(request: NextRequest) {
  const user = getTokenFromHeaders(request.headers);
  if (!user || user.role !== "guru") {
    return errorResponse("Unauthorized - hanya guru yang dapat mengupload", 401);
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;

    if (!file) {
      return errorResponse("File harus diupload", 400);
    }

    if (!type || (type !== "foto" && type !== "video")) {
      return errorResponse("Type harus 'foto' atau 'video'", 400);
    }

    const isImage = type === "foto";
    const allowedTypes = isImage ? ALLOWED_IMAGE_TYPES : ALLOWED_VIDEO_TYPES;
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;

    if (!allowedTypes.includes(file.type)) {
      return errorResponse(
        `Format file tidak didukung. Format yang didukung: ${allowedTypes.join(", ")}`,
        400
      );
    }

    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return errorResponse(`Ukuran file melebihi batas ${maxSizeMB}MB`, 400);
    }

    const ext = file.name.split(".").pop() || (isImage ? "jpg" : "mp4");
    const filename = `${uuidv4()}.${ext}`;
    const bucket = isImage ? "foto" : "video";
    const filePath = `${bucket}/${filename}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await getSupabase().storage
      .from("uploads")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return errorResponse(`Upload gagal: ${uploadError.message}`, 500);
    }

    const { data: urlData } = getSupabase().storage
      .from("uploads")
      .getPublicUrl(filePath);

    return successResponse(
      {
        url: urlData.publicUrl,
        filename,
        type,
        original_name: file.name,
        size: file.size,
      },
      "Upload berhasil",
      201
    );
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
