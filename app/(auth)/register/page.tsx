"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "", nickname: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("两次密码不一致");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password, nickname: form.nickname }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error?.message || "注册失败");
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      setLoading(false);

      if (result?.ok) {
        toast.success("注册成功");
        router.push("/");
        router.refresh();
      }
    } catch {
      setLoading(false);
      toast.error("网络错误");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md glass-card p-8">
        <h1 className="text-2xl font-bold text-ink text-center mb-6">注册剧本圈</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-ink-muted mb-1">昵称</label>
            <input
              type="text"
              required
              minLength={2}
              maxLength={20}
              value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-ink focus:outline-none focus:border-brand"
              placeholder="2-20个字符"
            />
          </div>

          <div>
            <label className="block text-sm text-ink-muted mb-1">邮箱</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-ink focus:outline-none focus:border-brand"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm text-ink-muted mb-1">密码</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-ink focus:outline-none focus:border-brand"
              placeholder="至少8位"
            />
          </div>

          <div>
            <label className="block text-sm text-ink-muted mb-1">确认密码</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-ink focus:outline-none focus:border-brand"
              placeholder="再次输入密码"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand hover:bg-brand-dark disabled:opacity-50 text-white rounded-lg font-medium"
          >
            {loading ? "注册中..." : "注册"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-ink-muted">
          已有账号？{" "}
          <Link href="/login" className="text-brand hover:underline">去登录</Link>
        </p>
      </div>
    </div>
  );
}
