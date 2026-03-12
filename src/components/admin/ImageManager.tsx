"use client";

import { useState, useEffect, useRef } from "react";

interface ImageInfo {
  name: string;
  url: string;
}

interface SlideImage {
  index: number;
  src: string;
}

interface ImageManagerProps {
  slideHtml: string;
  onUpdateHtml: (html: string) => void;
}

function getDoc(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

function serializeDoc(doc: Document): string {
  const serializer = new XMLSerializer();
  let result =
    "<!DOCTYPE html>" + serializer.serializeToString(doc.documentElement);
  result = result.replace(/ xmlns="http:\/\/www.w3.org\/1999\/xhtml"/g, "");
  const bodyMatch = result.match(/<body[^>]*>([\s\S]*)<\/body>/);
  return bodyMatch ? bodyMatch[1] : result;
}

function parseSlideImages(html: string): SlideImage[] {
  const doc = getDoc(html);
  const images: SlideImage[] = [];
  doc.querySelectorAll(".ss img, .slide img").forEach((img, i) => {
    images.push({
      index: i,
      src: (img as HTMLImageElement).getAttribute("src") || "",
    });
  });
  return images;
}

export default function ImageManager({
  slideHtml,
  onUpdateHtml,
}: ImageManagerProps) {
  const [availableImages, setAvailableImages] = useState<ImageInfo[]>([]);
  const [slideImages, setSlideImages] = useState<SlideImage[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerAction, setPickerAction] = useState<
    "add" | { type: "swap"; index: number }
  >("add");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadImages();
  }, []);

  useEffect(() => {
    setSlideImages(parseSlideImages(slideHtml));
  }, [slideHtml]);

  async function loadImages() {
    const res = await fetch("/api/admin/images");
    const data = await res.json();
    setAvailableImages(data);
  }

  async function uploadFile(file: File) {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/images", {
      method: "POST",
      body: formData,
    });
    const img = await res.json();
    setAvailableImages((prev) => [...prev, img]);
    setUploading(false);
    return img as ImageInfo;
  }

  function handleSwapImage(imgIdx: number) {
    setPickerAction({ type: "swap", index: imgIdx });
    setShowPicker(true);
  }

  function handleAddImage() {
    setPickerAction("add");
    setShowPicker(true);
  }

  function handleRemoveImage(imgIdx: number) {
    const doc = getDoc(slideHtml);
    const containers = doc.querySelectorAll(".ss");
    let count = 0;
    for (const ss of containers) {
      if (ss.querySelector("img")) {
        if (count === imgIdx) {
          ss.remove();
          onUpdateHtml(serializeDoc(doc));
          return;
        }
        count++;
      }
    }
    // Fallback: remove img directly
    const imgs = doc.querySelectorAll(".slide img");
    if (imgs[imgIdx]) {
      const parent = imgs[imgIdx].closest(".ss") || imgs[imgIdx].parentElement;
      if (parent) parent.remove();
      else imgs[imgIdx].remove();
      onUpdateHtml(serializeDoc(doc));
    }
  }

  function handlePickImage(img: ImageInfo) {
    const doc = getDoc(slideHtml);

    if (pickerAction === "add") {
      // Find or create image container
      const slideEl = doc.querySelector(".slide");
      if (!slideEl) return;

      const existingSS = doc.querySelectorAll(".ss");
      let insertParent: Element;

      if (existingSS.length > 0) {
        insertParent = existingSS[existingSS.length - 1].parentElement!;
      } else {
        insertParent = doc.createElement("div");
        (insertParent as HTMLElement).className = "z";
        (insertParent as HTMLElement).style.cssText =
          "flex:1;margin-top:28px;display:flex;gap:16px;";
        const sn = slideEl.querySelector(".sn");
        if (sn) sn.before(insertParent);
        else slideEl.appendChild(insertParent);
      }

      const newSS = doc.createElement("div");
      newSS.className = "ss";
      (newSS as HTMLElement).style.cssText = "flex:1;overflow:hidden;";
      newSS.innerHTML = `<img src="${img.url}" style="width:100%;height:100%;object-fit:cover;object-position:top;" />`;
      insertParent.appendChild(newSS);
    } else {
      // Swap existing image
      const imgs = doc.querySelectorAll(".ss img, .slide img");
      if (imgs[pickerAction.index]) {
        imgs[pickerAction.index].setAttribute("src", img.url);
      }
    }

    onUpdateHtml(serializeDoc(doc));
    setShowPicker(false);
  }

  return (
    <div className="space-y-3">
      <div className="text-[11px] text-brand/70 font-mono uppercase tracking-wider">
        Images
      </div>

      {/* Current slide images */}
      {slideImages.length > 0 ? (
        <div className="space-y-2">
          {slideImages.map((img, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-[#080818] border border-white/5 rounded-lg p-2"
            >
              <img
                src={
                  img.src.startsWith("/api")
                    ? img.src
                    : img.src.startsWith("data:")
                      ? img.src
                      : img.src
                }
                alt=""
                className="w-16 h-12 object-cover rounded border border-white/10"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.background = "#333";
                }}
              />
              <span className="flex-1 text-[10px] text-white/30 font-mono truncate">
                {img.src.split("/").pop()?.substring(0, 30)}
              </span>
              <button
                onClick={() => handleSwapImage(i)}
                className="text-[10px] font-mono text-brand/60 hover:text-brand transition-colors px-2 py-1"
              >
                swap
              </button>
              <button
                onClick={() => handleRemoveImage(i)}
                className="text-[10px] font-mono text-white/30 hover:text-red-400 transition-colors px-2 py-1"
              >
                remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[10px] text-white/20 font-mono">
          No images in this slide
        </p>
      )}

      <button
        onClick={handleAddImage}
        className="w-full text-xs font-mono text-brand/60 hover:text-brand border border-dashed border-white/10 hover:border-brand/30 rounded-lg py-2 transition-colors"
      >
        + Add image
      </button>

      {/* Upload */}
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) {
              const img = await uploadFile(file);
              // If picker is open, auto-select the uploaded image
              if (showPicker) {
                handlePickImage(img);
              }
            }
            e.target.value = "";
          }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex-1 text-[10px] font-mono text-white/30 hover:text-white/50 border border-white/5 rounded-lg py-1.5 transition-colors disabled:opacity-40"
        >
          {uploading ? "Uploading..." : "Upload new image"}
        </button>
      </div>

      {/* Image picker modal */}
      {showPicker && (
        <div
          className="fixed inset-0 bg-black/60 z-[400] flex items-center justify-center"
          onClick={() => setShowPicker(false)}
        >
          <div
            className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-5 max-w-lg w-[90%] max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-sm font-mono text-brand font-semibold flex-1">
                Pick an image
              </h3>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-[10px] font-mono text-brand/60 hover:text-brand border border-brand/20 rounded px-3 py-1 transition-colors"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>

            {availableImages.length === 0 ? (
              <p className="text-white/20 text-xs font-mono text-center py-8">
                No images uploaded yet.
                <br />
                Upload one using the button above.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {availableImages.map((img) => (
                  <button
                    key={img.name}
                    onClick={() => handlePickImage(img)}
                    className="rounded-lg overflow-hidden border-2 border-transparent hover:border-brand transition-colors group"
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full aspect-[4/3] object-cover"
                    />
                    <div className="text-[9px] text-white/30 font-mono p-1 truncate group-hover:text-brand transition-colors">
                      {img.name}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowPicker(false)}
              className="mt-3 w-full text-xs font-mono text-white/30 hover:text-white/50 py-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
