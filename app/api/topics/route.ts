import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, unauthorized, forbidden, badRequest } from "@/lib/auth-helpers";

export async function GET() {
  const topics = await db.topic.findMany({
    orderBy: [{ isPreset: "desc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(topics);
}

const createTopicSchema = z.object({
  name: z.string().min(2, "名称至少2个字符").max(30, "名称最多30个字符"),
  slug: z.string().min(2).max(30).regex(/^[a-z0-9-]+$/, "slug只能包含小写字母、数字和连字符"),
  description: z.string().max(200).optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "ADMIN") return forbidden();

  try {
    const body = await req.json();
    const { name, slug, description } = createTopicSchema.parse(body);

    const existing = await db.topic.findUnique({ where: { slug } });
    if (existing) {
      return badRequest("该slug已存在");
    }

    const topic = await db.topic.create({
      data: { name, slug, description: description || "" },
    });

    return NextResponse.json(topic, { status: 201 });
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
