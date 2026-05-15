"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart, Star, Flag, ArrowLeft, Trash2, Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { CommentList } from "@/components/comment-list";
import Link from "next/link";

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.id as string;
  const { data: session } = useSession();
  const router = useRouter();

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPost = useCallback(async () => {
    const res = await fetch(`/api/posts/${postId}`);
    if (res.ok) {
      setPost(await res.json());
    } else {
      toast.error("帖子不存在");
      router.push("/");
    }
    setLoading(false);
  }, [postId]);

  const fetchComments = useCallback(async () => {
    const res = await fetch(`/api/posts/${postId}/comments`);
    if (res.ok) {
      const data = await res.json();
      setComments(data.items);
    }
  }, [postId]);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [fetchPost, fetchComments]);

  const handleLike = async () => {
    if (!session) { toast.error("请先登录"); return; }
    const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    if (res.ok) fetchPost();
  };

  const handleFavorite = async () => {
    if (!session) { toast.error("请先登录"); return; }
    const res = await fetch(`/api/posts/${postId}/favorite`, { method: "POST" });
    if (res.ok) fetchPost();
  };

  const handleDelete = async () => {
    if (!confirm("确定删除这篇帖子吗？")) return;
    const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("已删除");
      router.push("/");
    }
  };

  const handleReport = async () => {
    if (!session) { toast.error("请先登录"); return; }
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType: "POST", targetId: postId, reason: "违规内容" }),
    });
    if (res.ok) toast.success("举报已提交");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 text-brand animate-spin" />
      </div>
    );
  }

  if (!post) return null;

  const isAuthor = (session?.user as any)?.id === post.author.id;
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Back button */}
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink mb-4">
        <ArrowLeft className="w-4 h-4" /> 返回
      </button>

      {/* Post content */}
      <article className="glass-card p-6 mb-6">
        {/* Author & meta */}
        <div className="flex items-center gap-3 mb-4">
          <Link href={`/users/${post.author.id}`} className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center text-brand font-medium">
            {post.author.nickname[0]}
          </Link>
          <div>
            <Link href={`/users/${post.author.id}`} className="text-sm font-medium text-ink hover:text-brand">
              {post.author.nickname}
            </Link>
            <div className="flex items-center gap-2 text-xs text-ink-faint">
              <span>{formatDate(post.createdAt)}</span>
              <span>·</span>
              <Link href={`/topics/${post.topic.slug}`} className="text-brand hover:underline">
                {post.topic.name}
              </Link>
            </div>
          </div>

          {/* Actions for author/admin */}
          {(isAuthor || isAdmin) && (
            <div className="ml-auto flex items-center gap-2">
              {isAuthor && (
                <button onClick={() => router.push(`/posts/new?edit=${post.id}`)} className="p-2 text-ink-faint hover:text-ink">
                  <Edit className="w-4 h-4" />
                </button>
              )}
              <button onClick={handleDelete} className="p-2 text-ink-faint hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-ink mb-4">{post.title}</h1>

        {/* Content */}
        <div className="text-ink-muted whitespace-pre-wrap leading-relaxed mb-4">
          {post.content}
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {post.images.map((img: any, i: number) => (
              <div key={i} className="aspect-square rounded-lg overflow-hidden bg-bg-elevated">
                <img src={img.url} alt="" className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform" />
              </div>
            ))}
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center gap-4 pt-4 border-t border-border">
          <button onClick={handleLike} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${post.isLiked ? "bg-brand/10 text-brand" : "text-ink-muted hover:text-brand"}`}>
            <Heart className={`w-4 h-4 ${post.isLiked ? "fill-brand" : ""}`} /> {post.likeCount || "点赞"}
          </button>
          <button onClick={handleFavorite} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${post.isFavorited ? "bg-yellow-500/10 text-yellow-400" : "text-ink-muted hover:text-yellow-400"}`}>
            <Star className={`w-4 h-4 ${post.isFavorited ? "fill-yellow-400" : ""}`} /> {post.favoriteCount || "收藏"}
          </button>
          <button onClick={handleReport} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-ink-muted hover:text-red-400 transition-colors ml-auto">
            <Flag className="w-4 h-4" /> 举报
          </button>
        </div>
      </article>

      {/* Comments */}
      <section className="glass-card p-6">
        <h2 className="text-base font-bold text-ink mb-4">
          评论 ({post.commentCount})
        </h2>
        <CommentList postId={postId} comments={comments} onRefresh={fetchComments} />
      </section>
    </div>
  );
}
