"use client";

import { useState, useEffect, useCallback } from "react";
import { PostCard } from "@/components/post-card";
import { TopicCard } from "@/components/topic-card";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const [topics, setTopics] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [sort, setSort] = useState<"latest" | "hot">("latest");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchTopics = async () => {
    const res = await fetch("/api/topics");
    if (res.ok) setTopics(await res.json());
  };

  const fetchPosts = useCallback(async (reset = false) => {
    if (reset) {
      setLoading(true);
      setPosts([]);
    } else {
      setLoadingMore(true);
    }

    const params = new URLSearchParams({ sort, limit: "20" });
    if (!reset && cursor) params.set("cursor", cursor);

    const res = await fetch(`/api/posts?${params}`);
    if (res.ok) {
      const data = await res.json();
      setPosts((prev) => (reset ? data.items : [...prev, ...data.items]));
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    }

    setLoading(false);
    setLoadingMore(false);
  }, [sort, cursor]);

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    setCursor(null);
    fetchPosts(true);
  }, [sort]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Topics section */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-ink mb-4">话题</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      </section>

      {/* Posts feed */}
      <section>
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-lg font-bold text-ink">帖子</h2>
          <div className="flex gap-1 bg-bg-card rounded-lg p-1">
            <button
              onClick={() => setSort("latest")}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                sort === "latest" ? "bg-brand text-white" : "text-ink-muted hover:text-ink"
              }`}
            >
              最新
            </button>
            <button
              onClick={() => setSort("hot")}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                sort === "hot" ? "bg-brand text-white" : "text-ink-muted hover:text-ink"
              }`}
            >
              热门
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-brand animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-ink-muted">
            <p>还没有帖子，快去发第一帖吧！</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}

            {hasMore && (
              <button
                onClick={() => fetchPosts(false)}
                disabled={loadingMore}
                className="w-full py-3 text-sm text-brand hover:underline disabled:opacity-50"
              >
                {loadingMore ? "加载中..." : "加载更多"}
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
