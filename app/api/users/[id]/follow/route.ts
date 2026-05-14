import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, unauthorized, badRequest } from "@/lib/auth-helpers";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  if (user.id === params.id) {
    return badRequest("不能关注自己");
  }

  const existing = await db.follow.findFirst({
    where: {
      followerId: user.id,
      type: "USER",
      targetUserId: params.id,
    },
  });

  if (existing) {
    await db.follow.delete({ where: { id: existing.id } });
    return NextResponse.json({ followed: false });
  } else {
    await db.follow.create({
      data: {
        followerId: user.id,
        type: "USER",
        targetUserId: params.id,
      },
    });
    return NextResponse.json({ followed: true });
  }
}
