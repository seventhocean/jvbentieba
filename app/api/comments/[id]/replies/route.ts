import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, unauthorized, notFound, badRequest } from "@/lib/auth-helpers";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  const replies = await db.comment.findMany({
    where: { parentId: params.id, status: "PUBLISHED" },
    orderBy: { createdAt: "asc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      author: { select: { id: true, nickname: true, avatarUrl: true } },
      parent: {
        select: { author: { select: { nickname: true } } },
      },
    },
  });

  const hasMore = replies.length > limit;
  const items = hasMore ? replies.slice(0, limit) : replies;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return NextResponse.json({ items, nextCursor, hasMore });
}

const replySchema = z.object({
  content: z.string().min(1, "回复不能为空").max(500, "回复最多500字符"),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const parentComment = await db.comment.findUnique({
    where: { id: params.id },
    include: { post: true },
  });
  if (!parentComment) return notFound("评论不存在");

  try {
    const body = await req.json();
    const { content } = replySchema.parse(body);

    const reply = await db.comment.create({
      data: {
        postId: parentComment.postId,
        authorId: user.id,
        parentId: params.id,
        content,
      },
      include: {
        author: { select: { id: true, nickname: true, avatarUrl: true } },
        parent: { select: { author: { select: { nickname: true } } } },
      },
    });

    await db.post.update({
      where: { id: parentComment.postId },
      data: { commentCount: { increment: 1 } },
    });

    return NextResponse.json(reply, { status: 201 });
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
