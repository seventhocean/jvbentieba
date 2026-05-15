import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session.user as {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: string;
  };
}

export function unauthorized() {
  return NextResponse.json(
    { error: { code: "UNAUTHORIZED", message: "请先登录" } },
    { status: 401 }
  );
}

export function forbidden() {
  return NextResponse.json(
    { error: { code: "FORBIDDEN", message: "没有权限" } },
    { status: 403 }
  );
}

export function badRequest(message: string) {
  return NextResponse.json(
    { error: { code: "BAD_REQUEST", message } },
    { status: 400 }
  );
}

export function notFound(message: string = "资源不存在") {
  return NextResponse.json(
    { error: { code: "NOT_FOUND", message } },
    { status: 404 }
  );
}
