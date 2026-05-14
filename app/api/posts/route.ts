import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, unauthorized, badRequest } from "@/lib/auth-helpers";

const createPostSchema = z.object({
  topicId: z.string().min(1, "请选择话题"),
  title: z.string().min(5, "标题至少5个字符").max(100, "标题最多100个字符"),
  content: z.string().min(10, "正文至少10个字符").max(10000, "正文最多10000个字符"),
  imageUrls: z.array(z.string()).max(9).optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const body = await req.json();
    const { topicId, title, content, imageUrls } = createPostSchema.parse(body);

    // Verify topic exists
    const topic = await db.topic.findUnique({ where: { id: topicId } });
    if (!topic) return badRequest("话题不存在");

    const post = await db.post.create({
      data: {
        authorId: user.id,
        topicId,
        title,
        content,
        images: imageUrls?.length
          ? {
              create: imageUrls.map((url, i) => ({ url, order: i })),
            }
          : undefined,
      },
      include: {
        author: { select: { id: true, nickname: true, avatarUrl: true } },
        topic: { select: { id: true, name: true, slug: true } },
        images: true,
      },
    });

    // Update topic post count
    await db.topic.update({
      where: { id: topicId },
      data: { postCount: { increment: 1 } },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest(error.errors[0].message);
    }
    console.error("Create post error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "服务器错误" } },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const topicSlug = searchParams.get("topicSlug");
  const sort = searchParams.get("sort") || "latest";
  const cursor = searchParams.get("cursor");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
  const authorId = searchParams.get("authorId");

  const where: any = { status: "PUBLISHED" };

  if (topicSlug) {
    const topic = await db.topic.findUnique({ where: { slug: topicSlug } });
    if (topic) where.topicId = topic.id;
  }

  if (authorId) {
    where.authorId = authorId;
  }

  const orderBy: any =
    sort === "hot"
      ? [{ likeCount: "desc" }, { createdAt: "desc" }]
      : [{ createdAt: "desc" }];

  const posts = await db.post.findMany({
    where,
    orderBy,
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      author: { select: { id: true, nickname: true, avatarUrl: true } },
      topic: { select: { id: true, name: true, slug: true } },
      images: { take: 1, orderBy: { order: "asc" } },
    },
  });

  const hasMore = posts.length > limit;
  const items = hasMore ? posts.slice(0, limit) : posts;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return NextResponse.json({ items, nextCursor, hasMore });
}
