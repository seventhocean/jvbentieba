"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
}

export function LoginDialog({ open, onClose }: LoginDialogProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nickname: "",
  });

  if (!open) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("登录成功");
      onClose();
      router.refresh();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
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
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          nickname: form.nickname,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error?.message || "注册失败");
        setLoading(false);
        return;
      }

      // Auto login after register
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      setLoading(false);

      if (result?.ok) {
        toast.success("注册成功");
        onClose();
        router.refresh();
      }
    } catch {
      setLoading(false);
      toast.error("网络错误");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-bg-elevated border border-border rounded-2xl p-6 shadow-glow">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ink-muted hover:text-ink"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-ink mb-6">
          {mode === "login" ? "登录剧本圈" : "注册账号"}
        </h2>

        <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-sm text-ink-muted mb-1">昵称</label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={20}
                value={form.nickname}
                onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                className="w-full px-4 py-2.5 bg-bg-card border border-border rounded-lg text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand"
                placeholder="2-20个字符"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-ink-muted mb-1">邮箱</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-bg-card border border-border rounded-lg text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand"
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
              className="w-full px-4 py-2.5 bg-bg-card border border-border rounded-lg text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand"
              placeholder="至少8位"
            />
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-sm text-ink-muted mb-1">确认密码</label>
              <input
                type="password"
                required
                minLength={8}
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full px-4 py-2.5 bg-bg-card border border-border rounded-lg text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand"
                placeholder="再次输入密码"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand hover:bg-brand-dark disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
          >
            {loading ? "处理中..." : mode === "login" ? "登录" : "注册"}
          </button>
        </form>

        {/* WeChat placeholder */}
        <div className="mt-4 pt-4 border-t border-border">
          <button
            onClick={() => toast.info("微信登录即将开放，敬请期待")}
            className="w-full py-2.5 border border-green-600 text-green-400 rounded-lg text-sm font-medium hover:bg-green-600/10 transition-colors"
          >
            微信扫码登录
          </button>
        </div>

        <p className="mt-4 text-center text-sm text-ink-muted">
          {mode === "login" ? (
            <>
              还没有账号？{" "}
              <button onClick={() => setMode("register")} className="text-brand hover:underline">
                立即注册
              </button>
            </>
          ) : (
            <>
              已有账号？{" "}
              <button onClick={() => setMode("login")} className="text-brand hover:underline">
                去登录
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
