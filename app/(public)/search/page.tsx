import { Suspense } from "react";
import SearchContent from "./search-content";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-4 py-6 text-center">加载中...</div>}>
      <SearchContent />
    </Suspense>
  );
}
