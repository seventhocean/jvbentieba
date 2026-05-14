"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("登录成功");
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md glass-card p-8">
        <h1 className="text-2xl font-bold text-ink text-center mb-6">登录剧本圈</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-ink-muted mb-1">邮箱</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-ink focus:outline-none focus:border-brand"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm text-ink-muted mb-1">密码</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-ink focus:outline-none focus:border-brand"
              placeholder="输入密码"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand hover:bg-brand-dark disabled:opacity-50 text-white rounded-lg font-medium"
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-border">
          <button
            onClick={() => toast.info("微信登录即将开放，敬请期待")}
            className="w-full py-2.5 border border-green-600 text-green-400 rounded-lg text-sm font-medium hover:bg-green-600/10"
          >
            微信扫码登录
          </button>
        </div>

        <p className="mt-4 text-center text-sm text-ink-muted">
          还没有账号？{" "}
          <Link href="/register" className="text-brand hover:underline">立即注册</Link>
        </p>
      </div>
    </div>
  );
}
