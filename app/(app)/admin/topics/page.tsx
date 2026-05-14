"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminTopicsPage() {
  const { data: session } = useSession();
  const [topics, setTopics] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", description: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    const res = await fetch("/api/topics");
    if (res.ok) setTopics(await res.json());
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const res = await fetch("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      toast.success("创建成功");
      setForm({ name: "", slug: "", description: "" });
      setShowCreate(false);
      fetchTopics();
    } else {
      const data = await res.json();
      toast.error(data.error?.message || "创建失败");
    }

    setSubmitting(false);
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("确定删除这个话题吗？")) return;
    const res = await fetch(`/api/topics/${slug}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("已删除");
      fetchTopics();
    } else {
      const data = await res.json();
      toast.error(data.error?.message || "删除失败");
    }
  };

  if ((session?.user as any)?.role !== "ADMIN") {
    return <div className="text-center py-20 text-ink-muted">无权限访问</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link href="/" className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink mb-4">
        <ArrowLeft className="w-4 h-4" /> 返回首页
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-ink">话题管理</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark"
        >
          <Plus className="w-4 h-4" /> 新建话题
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="glass-card p-4 mb-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="px-3 py-2 bg-bg border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-brand"
              placeholder="话题名称"
            />
            <input
              type="text"
              required
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
              className="px-3 py-2 bg-bg border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-brand"
              placeholder="slug (英文小写+连字符)"
            />
          </div>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-brand"
            placeholder="描述（可选）"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-brand text-white rounded-lg text-sm disabled:opacity-50">
              {submitting ? "创建中..." : "创建"}
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-ink-muted text-sm">
              取消
            </button>
          </div>
        </form>
      )}

      {/* Topic list */}
      <div className="space-y-2">
        {topics.map((topic) => (
          <div key={topic.id} className="glass-card p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-ink">{topic.name}</h3>
                <span className="text-xs text-ink-faint">/{topic.slug}</span>
                {topic.isPreset && (
                  <span className="text-xs px-1.5 py-0.5 bg-brand/10 text-brand rounded">预置</span>
                )}
              </div>
              <p className="text-xs text-ink-muted mt-0.5">{topic.description}</p>
            </div>
            {!topic.isPreset && (
              <button
                onClick={() => handleDelete(topic.slug)}
                className="p-2 text-ink-faint hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
