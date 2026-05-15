"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function MyFollowingPage() {
  const [tab, setTab] = useState<"TOPIC" | "USER">("TOPIC");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/me/following?type=${tab}`)
      .then((res) => res.json())
      .then((data) => setItems(data))
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link href="/me" className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink mb-4">
        <ArrowLeft className="w-4 h-4" /> 个人中心
      </Link>
      <h1 className="text-lg font-bold text-ink mb-4">我的关注</h1>

      <div className="flex gap-1 bg-bg-card rounded-lg p-1 mb-4 w-fit">
        <button
          onClick={() => setTab("TOPIC")}
          className={`px-3 py-1 rounded-md text-sm ${tab === "TOPIC" ? "bg-brand text-white" : "text-ink-muted"}`}
        >
          话题
        </button>
        <button
          onClick={() => setTab("USER")}
          className={`px-3 py-1 rounded-md text-sm ${tab === "USER" ? "bg-brand text-white" : "text-ink-muted"}`}
        >
          用户
        </button>
      </div>

      {loading ? (
        <p className="text-ink-muted py-8 text-center">加载中...</p>
      ) : items.length === 0 ? (
        <p className="text-ink-muted py-8 text-center">暂无关注</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Link
              key={item.id}
              href={tab === "TOPIC" ? `/topics/${item.slug}` : `/users/${item.id}`}
              className="glass-card p-3 flex items-center gap-3 hover:border-brand/40"
            >
              <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-brand text-sm font-medium">
                {(item.name || item.nickname || "?")[0]}
              </div>
              <span className="text-sm text-ink">{item.name || item.nickname}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
