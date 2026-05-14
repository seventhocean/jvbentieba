import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, unauthorized, forbidden, notFound, badRequest } from "@/lib/auth-helpers";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const topic = await db.topic.findUnique({
    where: { slug: params.slug },
  });

  if (!topic) return notFound("话题不存在");
  return NextResponse.json(topic);
}

const updateSchema = z.object({
  name: z.string().min(2).max(30).optional(),
  description: z.string().max(200).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "ADMIN") return forbidden();

  const topic = await db.topic.findUnique({ where: { slug: params.slug } });
  if (!topic) return notFound("话题不存在");

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    const updated = await db.topic.update({
      where: { slug: params.slug },
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
  { params }: { params: { slug: string } }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "ADMIN") return forbidden();

  const topic = await db.topic.findUnique({ where: { slug: params.slug } });
  if (!topic) return notFound("话题不存在");

  if (topic.isPreset) {
    return badRequest("预置话题不可删除");
  }

  await db.topic.delete({ where: { slug: params.slug } });
  return NextResponse.json({ success: true });
}
