"use client";

import Link from "next/link";
import { Users, FileText } from "lucide-react";

interface TopicCardProps {
  topic: {
    id: string;
    slug: string;
    name: string;
    description: string;
    postCount: number;
    followCount: number;
  };
}

export function TopicCard({ topic }: TopicCardProps) {
  return (
    <Link
      href={`/topics/${topic.slug}`}
      className="glass-card p-4 hover:border-brand/40 transition-colors block"
    >
      <h3 className="text-base font-medium text-ink mb-1">{topic.name}</h3>
      <p className="text-xs text-ink-muted line-clamp-2 mb-3">{topic.description}</p>
      <div className="flex items-center gap-3 text-xs text-ink-faint">
        <span className="flex items-center gap-1">
          <FileText className="w-3.5 h-3.5" /> {topic.postCount} 帖子
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" /> {topic.followCount} 关注
        </span>
      </div>
    </Link>
  );
}
