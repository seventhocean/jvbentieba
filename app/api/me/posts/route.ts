import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, unauthorized } from "@/lib/auth-helpers";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = 20;

  const posts = await db.post.findMany({
    where: { authorId: user.id, status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      topic: { select: { id: true, name: true, slug: true } },
      images: { take: 1 },
    },
  });

  const hasMore = posts.length > limit;
  const items = hasMore ? posts.slice(0, limit) : posts;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return NextResponse.json({ items, nextCursor, hasMore });
}
