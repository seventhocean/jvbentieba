"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { PostCard } from "@/components/post-card";
import { Loader2, UserPlus, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const { data: session } = useSession();

  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
    fetchPosts();
  }, [userId]);

  const fetchUser = async () => {
    const res = await fetch(`/api/users/${userId}`);
    if (res.ok) setUser(await res.json());
    setLoading(false);
  };

  const fetchPosts = async () => {
    const res = await fetch(`/api/posts?authorId=${userId}&limit=20`);
    if (res.ok) {
      const data = await res.json();
      setPosts(data.items);
    }
  };

  const handleFollow = async () => {
    if (!session) { toast.error("请先登录"); return; }
    const res = await fetch(`/api/users/${userId}/follow`, { method: "POST" });
    if (res.ok) fetchUser();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 text-brand animate-spin" />
      </div>
    );
  }

  if (!user) return <div className="text-center py-20 text-ink-muted">用户不存在</div>;

  const isMe = (session?.user as any)?.id === userId;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Profile header */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center text-brand text-2xl font-bold">
            {user.nickname[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-ink">{user.nickname}</h1>
            {user.bio && <p className="text-sm text-ink-muted mt-1">{user.bio}</p>}
            <p className="text-xs text-ink-faint mt-2">加入于 {formatDate(user.createdAt)}</p>
          </div>
          {!isMe && (
            <button
              onClick={handleFollow}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                user.isFollowing
                  ? "bg-bg-elevated text-ink-muted border border-border"
                  : "bg-brand text-white hover:bg-brand-dark"
              }`}
            >
              {user.isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {user.isFollowing ? "已关注" : "关注"}
            </button>
          )}
        </div>

        <div className="flex gap-6 mt-4 pt-4 border-t border-border text-sm">
          <span className="text-ink-muted"><strong className="text-ink">{user._count.posts}</strong> 帖子</span>
          <span className="text-ink-muted"><strong className="text-ink">{user._count.followers}</strong> 粉丝</span>
          <span className="text-ink-muted"><strong className="text-ink">{user._count.following}</strong> 关注</span>
        </div>
      </div>

      {/* User's posts */}
      <h2 className="text-lg font-bold text-ink mb-4">TA 的帖子</h2>
      {posts.length === 0 ? (
        <p className="text-center py-8 text-ink-muted">暂无帖子</p>
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
