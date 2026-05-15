import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, unauthorized } from "@/lib/auth-helpers";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = 20;

  const favorites = await db.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { userId_postId: { userId: user.id, postId: cursor } } } : {}),
    include: {
      post: {
        include: {
          author: { select: { id: true, nickname: true, avatarUrl: true } },
          topic: { select: { id: true, name: true, slug: true } },
          images: { take: 1 },
        },
      },
    },
  });

  const hasMore = favorites.length > limit;
  const items = hasMore ? favorites.slice(0, limit) : favorites;
  const nextCursor = hasMore ? items[items.length - 1].postId : null;

  return NextResponse.json({
    items: items.map((f) => f.post),
    nextCursor,
    hasMore,
  });
}
