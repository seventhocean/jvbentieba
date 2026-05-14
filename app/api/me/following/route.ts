import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, unauthorized } from "@/lib/auth-helpers";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "TOPIC"; // TOPIC or USER

  if (type === "TOPIC") {
    const follows = await db.follow.findMany({
      where: { followerId: user.id, type: "TOPIC" },
      include: { topic: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(follows.map((f) => f.topic));
  } else {
    const follows = await db.follow.findMany({
      where: { followerId: user.id, type: "USER" },
      include: {
        targetUser: {
          select: { id: true, nickname: true, avatarUrl: true, bio: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(follows.map((f) => f.targetUser));
  }
}
