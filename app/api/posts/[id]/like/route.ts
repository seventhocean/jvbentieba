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

  const existing = await db.like.findUnique({
    where: { userId_targetId_type: { userId: user.id, targetId: params.id, type: "POST" } },
  });

  if (existing) {
    await db.like.delete({ where: { id: existing.id } });
    await db.post.update({
      where: { id: params.id },
      data: { likeCount: { decrement: 1 } },
    });
    return NextResponse.json({ liked: false });
  } else {
    await db.like.create({
      data: { userId: user.id, targetId: params.id, type: "POST" },
    });
    await db.post.update({
      where: { id: params.id },
      data: { likeCount: { increment: 1 } },
    });
    return NextResponse.json({ liked: true });
  }
}
