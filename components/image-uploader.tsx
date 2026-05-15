"use client";

import { useState, useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
}

export function ImageUploader({ images, onChange, max = 9 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remaining = max - images.length;
    if (remaining <= 0) {
      toast.error(`最多上传${max}张图片`);
      return;
    }

    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);

    try {
      const urls: string[] = [];
      for (const file of toUpload) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} 超过5MB限制`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          urls.push(data.url);
        } else {
          toast.error(`${file.name} 上传失败`);
        }
      }

      if (urls.length > 0) {
        onChange([...images, ...urls]);
      }
    } catch {
      toast.error("上传失败");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {images.map((url, i) => (
          <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden group">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}

        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-20 h-20 border border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 text-ink-faint hover:border-brand hover:text-brand transition-colors disabled:opacity-50"
          >
            <ImagePlus className="w-5 h-5" />
            <span className="text-[10px]">{uploading ? "上传中" : "添加"}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
      />

      <p className="text-xs text-ink-faint">
        最多{max}张，单张不超过5MB，支持 jpg/png/webp/gif
      </p>
    </div>
  );
}
