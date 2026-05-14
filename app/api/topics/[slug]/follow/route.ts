import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, unauthorized, notFound } from "@/lib/auth-helpers";

export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const topic = await db.topic.findUnique({ where: { slug: params.slug } });
  if (!topic) return notFound("话题不存在");

  const existing = await db.follow.findFirst({
    where: {
      followerId: user.id,
      type: "TOPIC",
      targetTopicId: topic.id,
    },
  });

  if (existing) {
    // Unfollow
    await db.follow.delete({ where: { id: existing.id } });
    await db.topic.update({
      where: { id: topic.id },
      data: { followCount: { decrement: 1 } },
    });
    return NextResponse.json({ followed: false });
  } else {
    // Follow
    await db.follow.create({
      data: {
        followerId: user.id,
        type: "TOPIC",
        targetTopicId: topic.id,
      },
    });
    await db.topic.update({
      where: { id: topic.id },
      data: { followCount: { increment: 1 } },
    });
    return NextResponse.json({ followed: true });
  }
}
