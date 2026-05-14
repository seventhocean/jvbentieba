"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { FileText, Star, Users, Settings } from "lucide-react";

export default function MePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ nickname: "", bio: "" });

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setForm({ nickname: data.nickname || "", bio: data.bio || "" });
      });
  }, []);

  const handleSave = async () => {
    const res = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      toast.success("保存成功");
      setEditing(false);
      const data = await res.json();
      setProfile((p: any) => ({ ...p, ...data }));
    } else {
      const data = await res.json();
      toast.error(data.error?.message || "保存失败");
    }
  };

  if (!profile) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Profile card */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center text-brand text-2xl font-bold">
            {profile.nickname[0]}
          </div>
          <div className="flex-1">
            {editing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={form.nickname}
                  onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                  className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-ink text-sm focus:outline-none focus:border-brand"
                  placeholder="昵称"
                />
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-ink text-sm focus:outline-none focus:border-brand resize-none"
                  rows={2}
                  placeholder="签名"
                  maxLength={200}
                />
                <div className="flex gap-2">
                  <button onClick={handleSave} className="px-4 py-1.5 bg-brand text-white rounded-lg text-sm">保存</button>
                  <button onClick={() => setEditing(false)} className="px-4 py-1.5 text-ink-muted text-sm">取消</button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-xl font-bold text-ink">{profile.nickname}</h1>
                <p className="text-sm text-ink-muted mt-1">{profile.bio || "暂无签名"}</p>
                <p className="text-xs text-ink-faint mt-1">{profile.email}</p>
                <button onClick={() => setEditing(true)} className="mt-2 text-xs text-brand hover:underline flex items-center gap-1">
                  <Settings className="w-3 h-3" /> 编辑资料
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-6 mt-4 pt-4 border-t border-border text-sm">
          <span className="text-ink-muted"><strong className="text-ink">{profile._count.posts}</strong> 帖子</span>
          <span className="text-ink-muted"><strong className="text-ink">{profile._count.favorites}</strong> 收藏</span>
          <span className="text-ink-muted"><strong className="text-ink">{profile._count.followers}</strong> 粉丝</span>
          <span className="text-ink-muted"><strong className="text-ink">{profile._count.following}</strong> 关注</span>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Link href="/me/posts" className="glass-card p-4 hover:border-brand/40 flex items-center gap-3">
          <FileText className="w-5 h-5 text-brand" />
          <span className="text-sm text-ink">我的帖子</span>
        </Link>
        <Link href="/me/favorites" className="glass-card p-4 hover:border-brand/40 flex items-center gap-3">
          <Star className="w-5 h-5 text-yellow-400" />
          <span className="text-sm text-ink">我的收藏</span>
        </Link>
        <Link href="/me/following" className="glass-card p-4 hover:border-brand/40 flex items-center gap-3">
          <Users className="w-5 h-5 text-green-400" />
          <span className="text-sm text-ink">我的关注</span>
        </Link>
      </div>
    </div>
  );
}
