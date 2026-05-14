"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Heart, MessageCircle, Trash2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

interface Comment {
  id: string;
  content: string;
  likeCount: number;
  createdAt: string;
  author: { id: string; nickname: string; avatarUrl?: string | null };
  replies?: Reply[];
  _count?: { replies: number };
  parent?: { author: { nickname: string } } | null;
}

interface Reply {
  id: string;
  content: string;
  likeCount: number;
  createdAt: string;
  author: { id: string; nickname: string; avatarUrl?: string | null };
  parent?: { author: { nickname: string } } | null;
}

interface CommentListProps {
  postId: string;
  comments: Comment[];
  onRefresh: () => void;
}

export function CommentList({ postId, comments, onRefresh }: CommentListProps) {
  const { data: session } = useSession();
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; nickname: string } | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Record<string, Reply[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });
      if (res.ok) {
        setNewComment("");
        onRefresh();
        toast.success("评论成功");
      } else {
        const data = await res.json();
        toast.error(data.error?.message || "评论失败");
      }
    } catch {
      toast.error("网络错误");
    }
    setSubmitting(false);
  };

  const handleSubmitReply = async (commentId: string) => {
    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/comments/${commentId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent }),
      });
      if (res.ok) {
        setReplyContent("");
        setReplyTo(null);
        onRefresh();
        toast.success("回复成功");
      } else {
        const data = await res.json();
        toast.error(data.error?.message || "回复失败");
      }
    } catch {
      toast.error("网络错误");
    }
    setSubmitting(false);
  };

  const handleLike = async (commentId: string) => {
    if (!session) { toast.error("请先登录"); return; }
    await fetch(`/api/comments/${commentId}/like`, { method: "POST" });
    onRefresh();
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("确定删除这条评论吗？")) return;
    const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    if (res.ok) {
      onRefresh();
      toast.success("已删除");
    }
  };

  const loadMoreReplies = async (commentId: string) => {
    const res = await fetch(`/api/comments/${commentId}/replies?limit=50`);
    if (res.ok) {
      const data = await res.json();
      setExpandedReplies((prev) => ({ ...prev, [commentId]: data.items }));
    }
  };

  return (
    <div className="space-y-4">
      {/* Comment input */}
      {session ? (
        <form onSubmit={handleSubmitComment} className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="写评论..."
            maxLength={500}
            className="flex-1 px-4 py-2.5 bg-bg-card border border-border rounded-lg text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand"
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="px-4 py-2.5 bg-brand hover:bg-brand-dark disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            发送
          </button>
        </form>
      ) : (
        <p className="text-sm text-ink-muted text-center py-3">
          登录后可以评论
        </p>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-2">
            {/* Main comment */}
            <div className="glass-card p-3">
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-brand/20 flex items-center justify-center text-brand text-xs font-medium shrink-0 mt-0.5">
                  {comment.author.nickname[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-ink">{comment.author.nickname}</span>
                    <span className="text-xs text-ink-faint">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-ink-muted whitespace-pre-wrap">{comment.content}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button onClick={() => handleLike(comment.id)} className="flex items-center gap-1 text-xs text-ink-faint hover:text-brand transition-colors">
                      <Heart className="w-3.5 h-3.5" /> {comment.likeCount || ""}
                    </button>
                    {session && (
                      <button
                        onClick={() => setReplyTo({ id: comment.id, nickname: comment.author.nickname })}
                        className="flex items-center gap-1 text-xs text-ink-faint hover:text-brand transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> 回复
                      </button>
                    )}
                    {session && (session.user as any)?.id === comment.author.id && (
                      <button onClick={() => handleDelete(comment.id)} className="flex items-center gap-1 text-xs text-ink-faint hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Replies */}
            {(expandedReplies[comment.id] || comment.replies || []).length > 0 && (
              <div className="ml-9 space-y-2">
                {(expandedReplies[comment.id] || comment.replies || []).map((reply) => (
                  <div key={reply.id} className="p-2.5 bg-bg/50 border border-border/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-ink">{reply.author.nickname}</span>
                      {reply.parent?.author && (
                        <span className="text-xs text-ink-faint">
                          回复 <span className="text-brand-light">@{reply.parent.author.nickname}</span>
                        </span>
                      )}
                      <span className="text-xs text-ink-faint">{formatDate(reply.createdAt)}</span>
                    </div>
                    <p className="text-sm text-ink-muted">{reply.content}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <button onClick={() => handleLike(reply.id)} className="flex items-center gap-1 text-xs text-ink-faint hover:text-brand transition-colors">
                        <Heart className="w-3 h-3" /> {reply.likeCount || ""}
                      </button>
                      {session && (
                        <button
                          onClick={() => setReplyTo({ id: comment.id, nickname: reply.author.nickname })}
                          className="text-xs text-ink-faint hover:text-brand transition-colors"
                        >
                          回复
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Load more replies */}
                {comment._count && comment._count.replies > (comment.replies?.length || 0) && !expandedReplies[comment.id] && (
                  <button
                    onClick={() => loadMoreReplies(comment.id)}
                    className="flex items-center gap-1 text-xs text-brand hover:underline ml-2"
                  >
                    <ChevronDown className="w-3 h-3" />
                    展开更多回复 ({comment._count.replies}条)
                  </button>
                )}
              </div>
            )}

            {/* Reply input */}
            {replyTo?.id === comment.id && (
              <div className="ml-9 flex gap-2">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`回复 @${replyTo.nickname}...`}
                  maxLength={500}
                  autoFocus
                  className="flex-1 px-3 py-2 bg-bg-card border border-border rounded-lg text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand"
                />
                <button
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={submitting || !replyContent.trim()}
                  className="px-3 py-2 bg-brand hover:bg-brand-dark disabled:opacity-50 text-white rounded-lg text-xs font-medium"
                >
                  回复
                </button>
                <button
                  onClick={() => { setReplyTo(null); setReplyContent(""); }}
                  className="px-3 py-2 text-ink-muted text-xs"
                >
                  取消
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
