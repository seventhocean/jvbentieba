import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, unauthorized, notFound } from "@/lib/auth-helpers";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const post = await db.post.findUnique({ where: { id: params.id } });
  if (!post) return notFound("帖子不存在");

  const existing = await db.favorite.findUnique({
    where: { userId_postId: { userId: user.id, postId: params.id } },
  });

  if (existing) {
    await db.favorite.delete({
      where: { userId_postId: { userId: user.id, postId: params.id } },
    });
    await db.post.update({
      where: { id: params.id },
      data: { favoriteCount: { decrement: 1 } },
    });
    return NextResponse.json({ favorited: false });
  } else {
    await db.favorite.create({
      data: { userId: user.id, postId: params.id },
    });
    await db.post.update({
      where: { id: params.id },
      data: { favoriteCount: { increment: 1 } },
    });
    return NextResponse.json({ favorited: true });
  }
}
