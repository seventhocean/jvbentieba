"use client";

import { useState, useEffect } from "react";
import { PostCard } from "@/components/post-card";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function MyPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/me/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data.items || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link href="/me" className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink mb-4">
        <ArrowLeft className="w-4 h-4" /> 个人中心
      </Link>
      <h1 className="text-lg font-bold text-ink mb-4">我的帖子</h1>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-brand animate-spin" /></div>
      ) : posts.length === 0 ? (
        <p className="text-center py-12 text-ink-muted">暂无帖子</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
