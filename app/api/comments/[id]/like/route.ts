import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, unauthorized, notFound } from "@/lib/auth-helpers";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const comment = await db.comment.findUnique({ where: { id: params.id } });
  if (!comment) return notFound("评论不存在");

  const existing = await db.like.findUnique({
    where: { userId_targetId_type: { userId: user.id, targetId: params.id, type: "COMMENT" } },
  });

  if (existing) {
    await db.like.delete({ where: { id: existing.id } });
    await db.comment.update({
      where: { id: params.id },
      data: { likeCount: { decrement: 1 } },
    });
    return NextResponse.json({ liked: false });
  } else {
    await db.like.create({
      data: { userId: user.id, targetId: params.id, type: "COMMENT" },
    });
    await db.comment.update({
      where: { id: params.id },
      data: { likeCount: { increment: 1 } },
    });
    return NextResponse.json({ liked: true });
  }
}
