import { NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";

const registerSchema = z.object({
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(8, "密码至少8位"),
  nickname: z.string().min(2, "昵称至少2个字符").max(20, "昵称最多20个字符"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, nickname } = registerSchema.parse(body);

    // Check email uniqueness
    const existingEmail = await db.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json(
        { error: { code: "CONFLICT", message: "该邮箱已被注册" } },
        { status: 409 }
      );
    }

    // Check nickname uniqueness
    const existingNickname = await db.user.findUnique({ where: { nickname } });
    if (existingNickname) {
      return NextResponse.json(
        { error: { code: "CONFLICT", message: "该昵称已被使用" } },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);
    const user = await db.user.create({
      data: { email, passwordHash, nickname },
    });

    return NextResponse.json(
      { id: user.id, email: user.email, nickname: user.nickname },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: error.errors[0].message } },
        { status: 400 }
      );
    }
    console.error("Register error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "服务器错误" } },
      { status: 500 }
    );
  }
}
