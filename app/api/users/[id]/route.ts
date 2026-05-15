import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notFound, getCurrentUser } from "@/lib/auth-helpers";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await db.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      nickname: true,
      avatarUrl: true,
      bio: true,
      createdAt: true,
      _count: {
        select: {
          posts: { where: { status: "PUBLISHED" } },
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) return notFound("用户不存在");

  // Check if current user is following
  const currentUser = await getCurrentUser();
  let isFollowing = false;
  if (currentUser && currentUser.id !== params.id) {
    const follow = await db.follow.findFirst({
      where: {
        followerId: currentUser.id,
        type: "USER",
        targetUserId: params.id,
      },
    });
    isFollowing = !!follow;
  }

  return NextResponse.json({ ...user, isFollowing });
}
