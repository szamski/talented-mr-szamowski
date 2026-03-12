"use client";

import { SLIDE_TEMPLATES } from "@/lib/slide-templates";

interface AddSlideModalProps {
  onAdd: (html: string) => void;
  onClose: () => void;
}

const TEMPLATE_OPTIONS = [
  { key: "cover", label: "Cover", desc: "Title + pills + images" },
  { key: "challenge", label: "Challenge", desc: "Glow dots + points" },
  { key: "techStack", label: "Tech Stack", desc: "Glass card grid" },
  { key: "results", label: "Results", desc: "Stats + metrics" },
  { key: "cta", label: "CTA", desc: "Centered call to action" },
  { key: "blank", label: "Blank", desc: "Empty slide" },
] as const;

export default function AddSlideModal({ onAdd, onClose }: AddSlideModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 max-w-lg w-[90%]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-mono text-brand font-semibold mb-4">
          Add Slide
        </h3>
        <div className="space-y-2">
          {TEMPLATE_OPTIONS.map((t) => (
            <button
              key={t.key}
              onClick={() =>
                onAdd(
                  SLIDE_TEMPLATES[t.key as keyof typeof SLIDE_TEMPLATES]
                )
              }
              className="w-full text-left px-4 py-3 rounded-lg border border-white/5 hover:border-brand/30 bg-[#080818] hover:bg-[#0a0a20] transition-colors group"
            >
              <span className="text-sm text-white font-semibold group-hover:text-brand transition-colors">
                {t.label}
              </span>
              <span className="text-xs text-white/30 font-mono ml-3">
                {t.desc}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full text-center text-xs font-mono text-white/30 hover:text-white/50 py-2 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
