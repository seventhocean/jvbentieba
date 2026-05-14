"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { Users, FileText, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function TopicPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: session } = useSession();
  const router = useRouter();

  const [topic, setTopic] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [sort, setSort] = useState<"latest" | "hot">("latest");
  const [loading, setLoading] = useState(true);
  const [isFollowed, setIsFollowed] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchTopic();
  }, [slug]);

  useEffect(() => {
    fetchPosts(true);
  }, [slug, sort]);

  const fetchTopic = async () => {
    const res = await fetch(`/api/topics/${slug}`);
    if (res.ok) setTopic(await res.json());
  };

  const fetchPosts = async (reset = false) => {
    if (reset) { setLoading(true); setPosts([]); }
    const params = new URLSearchParams({ topicSlug: slug, sort, limit: "20" });
    if (!reset && cursor) params.set("cursor", cursor);

    const res = await fetch(`/api/posts?${params}`);
    if (res.ok) {
      const data = await res.json();
      setPosts((prev) => reset ? data.items : [...prev, ...data.items]);
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    }
    setLoading(false);
  };

  const handleFollow = async () => {
    if (!session) { toast.error("请先登录"); return; }
    const res = await fetch(`/api/topics/${slug}/follow`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setIsFollowed(data.followed);
      fetchTopic();
    }
  };

  if (!topic) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-6 h-6 text-brand animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Topic header */}
      <div className="glass-card p-6 mb-6">
        <h1 className="text-2xl font-bold text-ink mb-2">{topic.name}</h1>
        <p className="text-sm text-ink-muted mb-4">{topic.description}</p>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-sm text-ink-faint">
            <FileText className="w-4 h-4" /> {topic.postCount} 帖子
          </span>
          <span className="flex items-center gap-1 text-sm text-ink-faint">
            <Users className="w-4 h-4" /> {topic.followCount} 关注
          </span>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={handleFollow}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isFollowed
                  ? "bg-bg-elevated text-ink-muted border border-border"
                  : "bg-brand text-white hover:bg-brand-dark"
              }`}
            >
              {isFollowed ? "已关注" : "关注"}
            </button>
            <button
              onClick={() => {
                if (!session) { toast.error("请先登录"); return; }
                router.push(`/posts/new?topic=${slug}`);
              }}
              className="flex items-center gap-1 px-4 py-1.5 border border-brand text-brand rounded-lg text-sm font-medium hover:bg-brand/10"
            >
              <Plus className="w-4 h-4" /> 发帖
            </button>
          </div>
        </div>
      </div>

      {/* Sort tabs */}
      <div className="flex gap-1 bg-bg-card rounded-lg p-1 mb-4 w-fit">
        <button
          onClick={() => setSort("latest")}
          className={`px-3 py-1 rounded-md text-sm ${sort === "latest" ? "bg-brand text-white" : "text-ink-muted"}`}
        >
          最新
        </button>
        <button
          onClick={() => setSort("hot")}
          className={`px-3 py-1 rounded-md text-sm ${sort === "hot" ? "bg-brand text-white" : "text-ink-muted"}`}
        >
          热门
        </button>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-brand animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-ink-muted">还没有帖子</div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {hasMore && (
            <button onClick={() => fetchPosts(false)} className="w-full py-3 text-sm text-brand hover:underline">
              加载更多
            </button>
          )}
        </div>
      )}
    </div>
  );
}
