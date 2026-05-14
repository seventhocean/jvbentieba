import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const PUBLIC_BASE = process.env.NEXT_PUBLIC_UPLOAD_BASE || "/uploads";

export async function saveUploadedFile(
  buffer: Buffer,
  originalName: string
): Promise<{ url: string; fileName: string }> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const dir = path.join(UPLOAD_DIR, String(year), month);

  await fs.mkdir(dir, { recursive: true });

  const ext = path.extname(originalName) || ".jpg";
  const fileName = `${randomUUID()}${ext}`;
  const filePath = path.join(dir, fileName);

  await fs.writeFile(filePath, buffer);

  const url = `${PUBLIC_BASE}/${year}/${month}/${fileName}`;
  return { url, fileName };
}

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
