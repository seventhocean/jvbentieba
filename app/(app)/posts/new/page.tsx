"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ImageUploader } from "@/components/image-uploader";
import { ArrowLeft } from "lucide-react";

export default function NewPostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTopic = searchParams.get("topic");

  const [topics, setTopics] = useState<any[]>([]);
  const [form, setForm] = useState({
    topicId: "",
    title: "",
    content: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/topics")
      .then((res) => res.json())
      .then((data) => {
        setTopics(data);
        if (preselectedTopic) {
          const found = data.find((t: any) => t.slug === preselectedTopic);
          if (found) setForm((f) => ({ ...f, topicId: found.id }));
        }
      });
  }, [preselectedTopic]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.topicId) { toast.error("请选择话题"); return; }
    if (form.title.length < 5) { toast.error("标题至少5个字符"); return; }
    if (form.content.length < 10) { toast.error("正文至少10个字符"); return; }

    setSubmitting(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          imageUrls: images.length > 0 ? images : undefined,
        }),
      });

      if (res.ok) {
        const post = await res.json();
        toast.success("发帖成功");
        router.push(`/posts/${post.id}`);
      } else {
        const data = await res.json();
        toast.error(data.error?.message || "发帖失败");
      }
    } catch {
      toast.error("网络错误");
    }

    setSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink mb-4">
        <ArrowLeft className="w-4 h-4" /> 返回
      </button>

      <div className="glass-card p-6">
        <h1 className="text-xl font-bold text-ink mb-6">发帖</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Topic select */}
          <div>
            <label className="block text-sm text-ink-muted mb-2">选择话题 *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => setForm({ ...form, topicId: topic.id })}
                  className={`px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                    form.topicId === topic.id
                      ? "bg-brand text-white"
                      : "bg-bg-elevated text-ink-muted hover:text-ink border border-border"
                  }`}
                >
                  {topic.name}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm text-ink-muted mb-1">标题 *</label>
            <input
              type="text"
              required
              minLength={5}
              maxLength={100}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-ink focus:outline-none focus:border-brand"
              placeholder="5-100个字符"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm text-ink-muted mb-1">正文 *</label>
            <textarea
              required
              minLength={10}
              maxLength={10000}
              rows={8}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-ink focus:outline-none focus:border-brand resize-y"
              placeholder="分享你的想法...（至少10个字符）"
            />
            <p className="text-xs text-ink-faint mt-1 text-right">{form.content.length}/10000</p>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm text-ink-muted mb-2">图片（可选）</label>
            <ImageUploader images={images} onChange={setImages} />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-brand hover:bg-brand-dark disabled:opacity-50 text-white rounded-lg font-medium text-base transition-colors"
          >
            {submitting ? "发布中..." : "发布"}
          </button>
        </form>
      </div>
    </div>
  );
}
