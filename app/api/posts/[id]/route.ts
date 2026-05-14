import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, unauthorized, forbidden, notFound, badRequest } from "@/lib/auth-helpers";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const post = await db.post.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { id: true, nickname: true, avatarUrl: true, bio: true } },
      topic: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { order: "asc" } },
    },
  });

  if (!post || post.status === "DELETED") return notFound("帖子不存在");

  // Increment view count
  await db.post.update({
    where: { id: params.id },
    data: { viewCount: { increment: 1 } },
  });

  // Check if current user liked/favorited
  const user = await getCurrentUser();
  let isLiked = false;
  let isFavorited = false;

  if (user) {
    const like = await db.like.findUnique({
      where: { userId_targetId_type: { userId: user.id, targetId: post.id, type: "POST" } },
    });
    isLiked = !!like;

    const fav = await db.favorite.findUnique({
      where: { userId_postId: { userId: user.id, postId: post.id } },
    });
    isFavorited = !!fav;
  }

  return NextResponse.json({ ...post, isLiked, isFavorited });
}

const updateSchema = z.object({
  title: z.string().min(5).max(100).optional(),
  content: z.string().min(10).max(10000).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const post = await db.post.findUnique({ where: { id: params.id } });
  if (!post) return notFound("帖子不存在");

  if (post.authorId !== user.id && user.role !== "ADMIN") {
    return forbidden();
  }

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    const updated = await db.post.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest(error.errors[0].message);
    }
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "服务器错误" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const post = await db.post.findUnique({ where: { id: params.id } });
  if (!post) return notFound("帖子不存在");

  if (post.authorId !== user.id && user.role !== "ADMIN") {
    return forbidden();
  }

  await db.post.update({
    where: { id: params.id },
    data: { status: "DELETED" },
  });

  return NextResponse.json({ success: true });
}
