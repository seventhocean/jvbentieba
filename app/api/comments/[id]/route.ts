import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, unauthorized, forbidden, notFound } from "@/lib/auth-helpers";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const comment = await db.comment.findUnique({ where: { id: params.id } });
  if (!comment) return notFound("评论不存在");

  if (comment.authorId !== user.id && user.role !== "ADMIN") {
    return forbidden();
  }

  await db.comment.update({
    where: { id: params.id },
    data: { status: "DELETED" },
  });

  // Decrement post comment count
  await db.post.update({
    where: { id: comment.postId },
    data: { commentCount: { decrement: 1 } },
  });

  return NextResponse.json({ success: true });
}
