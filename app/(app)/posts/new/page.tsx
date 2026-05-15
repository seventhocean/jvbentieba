import { Suspense } from "react";
import NewPostContent from "./new-post-content";

export default function NewPostPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-6 text-center">加载中...</div>}>
      <NewPostContent />
    </Suspense>
  );
}
