"use client";

import { useRef, useEffect, useCallback } from "react";
import { SLIDE_STYLES } from "@/lib/slide-templates";

interface SlidePreviewProps {
  slide: { id: string; html: string };
  index: number;
  total: number;
  isActive: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export default function SlidePreview({
  slide,
  index,
  total,
  isActive,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: SlidePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const recalcScale = useCallback(() => {
    if (iframeRef.current && wrapRef.current) {
      const scale = wrapRef.current.offsetWidth / 1080;
      iframeRef.current.style.transform = `scale(${scale})`;
    }
  }, []);

  useEffect(() => {
    recalcScale();
  }, [slide.html, recalcScale]);

  // Re-scale on container resize (e.g. when editor panel opens/closes)
  useEffect(() => {
    const observer = new ResizeObserver(recalcScale);
    if (wrapRef.current) observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, [recalcScale]);

  const srcdoc = `<!DOCTYPE html><html><head><style>${SLIDE_STYLES}</style><link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet"></head><body style="margin:0;overflow:hidden;">${slide.html}</body></html>`;

  return (
    <div
      className={`rounded-xl overflow-hidden border transition-all ${
        isActive
          ? "border-brand/50 ring-1 ring-brand/20"
          : "border-white/5 hover:border-brand/20"
      }`}
      style={{ background: "rgba(5,10,8,0.6)" }}
    >
      {/* Header */}
      <div className="px-4 py-2.5 flex items-center gap-2 border-b border-white/5 bg-[rgba(5,10,8,0.8)]">
        <span className="text-xs font-mono text-brand font-semibold">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="text-xs font-mono text-white/20">/ {total}</span>
        <div className="flex-1" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp();
          }}
          disabled={index === 0}
          className="text-white/30 hover:text-white text-xs px-1 disabled:opacity-20 disabled:cursor-default"
          title="Move up"
        >
          &#9650;
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
          disabled={index === total - 1}
          className="text-white/30 hover:text-white text-xs px-1 disabled:opacity-20 disabled:cursor-default"
          title="Move down"
        >
          &#9660;
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="text-brand/60 hover:text-brand text-xs font-mono transition-colors"
        >
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          disabled={total <= 1}
          className="text-white/20 hover:text-red-400 text-xs font-mono transition-colors disabled:opacity-20 disabled:cursor-default"
        >
          Delete
        </button>
      </div>

      {/* Preview */}
      <div
        ref={wrapRef}
        className="relative w-full overflow-hidden cursor-pointer"
        style={{ paddingTop: "125%", background: "#050a08" }}
        onClick={onEdit}
      >
        <iframe
          ref={iframeRef}
          srcDoc={srcdoc}
          sandbox="allow-same-origin"
          className="absolute top-0 left-0 border-none pointer-events-none"
          style={{
            width: "1080px",
            height: "1350px",
            transformOrigin: "top left",
          }}
        />
      </div>
    </div>
  );
}
