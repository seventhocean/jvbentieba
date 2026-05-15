import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import { getCurrentUser, unauthorized, badRequest } from "@/lib/auth-helpers";

const updateProfileSchema = z.object({
  nickname: z.string().min(2).max(20).optional(),
  bio: z.string().max(200).optional(),
  avatarUrl: z.string().optional(),
  password: z.string().min(8).optional(),
});

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const body = await req.json();
    const { nickname, bio, avatarUrl, password } = updateProfileSchema.parse(body);

    const data: any = {};
    if (nickname !== undefined) {
      const existing = await db.user.findFirst({
        where: { nickname, id: { not: user.id } },
      });
      if (existing) return badRequest("该昵称已被使用");
      data.nickname = nickname;
    }
    if (bio !== undefined) data.bio = bio;
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;
    if (password) data.passwordHash = await hash(password, 12);

    const updated = await db.user.update({
      where: { id: user.id },
      data,
      select: { id: true, nickname: true, avatarUrl: true, bio: true, email: true },
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

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const profile = await db.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      nickname: true,
      avatarUrl: true,
      bio: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          posts: { where: { status: "PUBLISHED" } },
          favorites: true,
          following: true,
          followers: true,
        },
      },
    },
  });

  return NextResponse.json(profile);
}
