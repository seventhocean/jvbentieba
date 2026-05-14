import { NextResponse } from "next/server";
import { getCurrentUser, unauthorized, badRequest } from "@/lib/auth-helpers";
import { saveUploadedFile, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/lib/upload";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return badRequest("请选择文件");

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return badRequest("仅支持 jpg/png/webp/gif 格式");
    }

    if (file.size > MAX_FILE_SIZE) {
      return badRequest("文件大小不能超过5MB");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { url } = await saveUploadedFile(buffer, file.name);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "上传失败" } },
      { status: 500 }
    );
  }
}
