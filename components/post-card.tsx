"use client";

import Link from "next/link";
import { Heart, MessageCircle, Eye } from "lucide-react";
import { formatDate, truncate } from "@/lib/utils";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    likeCount: number;
    commentCount: number;
    viewCount: number;
    createdAt: string;
    author: { id: string; nickname: string; avatarUrl?: string | null };
    topic: { id: string; name: string; slug: string };
    images?: { url: string }[];
  };
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/posts/${post.id}`} className="block glass-card p-4 hover:border-brand/40 transition-colors">
      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          {/* Author + Topic */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center text-brand text-xs font-medium shrink-0">
              {post.author.nickname[0]}
            </div>
            <span className="text-sm text-ink-muted truncate">{post.author.nickname}</span>
            <span className="text-xs text-ink-faint">·</span>
            <span className="text-xs px-2 py-0.5 bg-brand/10 text-brand rounded-full">{post.topic.name}</span>
            <span className="text-xs text-ink-faint ml-auto shrink-0">{formatDate(post.createdAt)}</span>
          </div>

          {/* Title */}
          <h3 className="text-base font-medium text-ink mb-1 line-clamp-1">{post.title}</h3>

          {/* Content preview */}
          <p className="text-sm text-ink-muted line-clamp-2">{truncate(post.content, 120)}</p>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-3 text-xs text-ink-faint">
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" /> {post.likeCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" /> {post.commentCount}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {post.viewCount}
            </span>
          </div>
        </div>

        {/* Thumbnail */}
        {post.images && post.images.length > 0 && (
          <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-bg-elevated">
            <img
              src={post.images[0].url}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </Link>
  );
}
