"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { Loader2, Search } from "lucide-react";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (q.trim().length >= 2) {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(q)}`)
        .then((res) => res.json())
        .then((data) => setResults(data.items || []))
        .finally(() => setLoading(false));
    }
  }, [q]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
        <Search className="w-5 h-5 text-brand" />
        搜索结果：{q}
      </h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-brand animate-spin" />
        </div>
      ) : results.length === 0 ? (
        <p className="text-center py-12 text-ink-muted">
          {q.length < 2 ? "请输入至少2个字符" : "没有找到相关内容"}
        </p>
      ) : (
        <div className="space-y-3">
          {results.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
