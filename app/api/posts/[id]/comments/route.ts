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

  const comments = await db.comment.findMany({
    where: { postId: params.id, parentId: null, status: "PUBLISHED" },
    orderBy: { createdAt: "asc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      author: { select: { id: true, nickname: true, avatarUrl: true } },
      replies: {
        where: { status: "PUBLISHED" },
        take: 3,
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, nickname: true, avatarUrl: true } },
          parent: {
            select: { author: { select: { nickname: true } } },
          },
        },
      },
      _count: { select: { replies: { where: { status: "PUBLISHED" } } } },
    },
  });

  const hasMore = comments.length > limit;
  const items = hasMore ? comments.slice(0, limit) : comments;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return NextResponse.json({ items, nextCursor, hasMore });
}

const createCommentSchema = z.object({
  content: z.string().min(1, "评论不能为空").max(500, "评论最多500字符"),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const post = await db.post.findUnique({ where: { id: params.id } });
  if (!post || post.status === "DELETED") return notFound("帖子不存在");

  try {
    const body = await req.json();
    const { content } = createCommentSchema.parse(body);

    const comment = await db.comment.create({
      data: {
        postId: params.id,
        authorId: user.id,
        content,
      },
      include: {
        author: { select: { id: true, nickname: true, avatarUrl: true } },
      },
    });

    await db.post.update({
      where: { id: params.id },
      data: { commentCount: { increment: 1 } },
    });

    return NextResponse.json(comment, { status: 201 });
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
