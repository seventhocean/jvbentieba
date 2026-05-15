import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ items: [] });
  }

  const keyword = `%${q.trim()}%`;

  const posts = await db.post.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: q.trim(), mode: "insensitive" } },
        { content: { contains: q.trim(), mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      author: { select: { id: true, nickname: true, avatarUrl: true } },
      topic: { select: { id: true, name: true, slug: true } },
      images: { take: 1 },
    },
  });

  return NextResponse.json({ items: posts });
}
