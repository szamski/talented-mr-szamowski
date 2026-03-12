"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import AdminNavbar from "@/components/admin/AdminNavbar";

/*
 * LinkedIn Cover Photo: 1584 x 396
 * Avatar overlap zone: bottom-left ~220x160px area
 * Layout: Hero-style — eyebrow + headline left, skill tags right
 */

const COVER_W = 1584;
const COVER_H = 396;

const AVATAR_ZONE = { x: 0, y: 200, w: 250, h: 196 };

const DEFAULT_TAGS = ["Python", "Next.js", "TikTok Ads", "BigQuery", "Meta Ads", "Analytics"];

export default function CoverPhotoPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [bgSrc, setBgSrc] = useState<string | null>(null);
  const [bgScale, setBgScale] = useState(1);
  const [bgOffsetX, setBgOffsetX] = useState(0);
  const [bgOffsetY, setBgOffsetY] = useState(0);
  const [bgOpacity, setBgOpacity] = useState(0.15);
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  // Text
  const [eyebrow, setEyebrow] = useState("STRATEGY CONSULTANT · FULLSTACK DEVELOPER");
  const [headlinePre, setHeadlinePre] = useState("I bridge the gap between");
  const [headlineHighlight, setHeadlineHighlight] = useState("marketing strategy");
  const [headlinePost, setHeadlinePost] = useState("and technical execution.");
  const [description, setDescription] = useState(
    "15 years in digital performance. Self-taught developer.\nBuilding tools that turn data into decisions."
  );
  const [tags, setTags] = useState<string[]>(DEFAULT_TAGS);
  const [tagInput, setTagInput] = useState("");

  // Layout
  const [textScale, setTextScale] = useState(1);
  const [textX, setTextX] = useState(300);
  const [textY, setTextY] = useState(80);
  const [tagsX, setTagsX] = useState(1100);

  // Toggles
  const [showSafeZones, setShowSafeZones] = useState(true);
  const [showDotMatrix, setShowDotMatrix] = useState(true);
  const [showOrbs, setShowOrbs] = useState(true);

  // Load saved settings
  useEffect(() => {
    fetch("/api/admin/cover-photo")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setEyebrow(data.eyebrow ?? eyebrow);
          setHeadlinePre(data.headlinePre ?? headlinePre);
          setHeadlineHighlight(data.headlineHighlight ?? headlineHighlight);
          setHeadlinePost(data.headlinePost ?? headlinePost);
          setDescription(data.description ?? description);
          setTags(data.tags ?? tags);
          setTextScale(data.textScale ?? textScale);
          setTextX(data.textX ?? textX);
          setTextY(data.textY ?? textY);
          setTagsX(data.tagsX ?? tagsX);
          setShowDotMatrix(data.showDotMatrix ?? showDotMatrix);
          setShowOrbs(data.showOrbs ?? showOrbs);
          setBgOpacity(data.bgOpacity ?? bgOpacity);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save on changes (debounced)
  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => {
      const settings = {
        eyebrow, headlinePre, headlineHighlight, headlinePost, description,
        tags, textScale, textX, textY, tagsX,
        showDotMatrix, showOrbs, bgOpacity,
        updatedAt: new Date().toISOString(),
      };
      fetch("/api/admin/cover-photo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      }).then(() => {
        setSaveStatus("Saved");
        setTimeout(() => setSaveStatus(""), 2000);
      });
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    loaded, eyebrow, headlinePre, headlineHighlight, headlinePost, description,
    tags, textScale, textX, textY, tagsX, showDotMatrix, showOrbs, bgOpacity,
  ]);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => setBgSrc(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) handleFile(file);
        return;
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const render = useCallback(
    (exportMode = false) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = COVER_W;
      canvas.height = COVER_H;

      // Background gradient
      const bg = ctx.createLinearGradient(0, 0, COVER_W * 0.6, COVER_H);
      bg.addColorStop(0, "#050a08");
      bg.addColorStop(0.3, "#071210");
      bg.addColorStop(0.6, "#0a1a14");
      bg.addColorStop(1, "#0d1f18");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, COVER_W, COVER_H);

      // Subtle top-right lighter area (like the screenshot)
      const topGlow = ctx.createRadialGradient(COVER_W * 0.8, 0, 0, COVER_W * 0.8, 0, 500);
      topGlow.addColorStop(0, "rgba(20,40,50,0.4)");
      topGlow.addColorStop(1, "transparent");
      ctx.fillStyle = topGlow;
      ctx.fillRect(0, 0, COVER_W, COVER_H);

      // Dot matrix
      if (showDotMatrix) {
        ctx.fillStyle = "rgba(13,223,114,0.02)";
        for (let x = 0; x < COVER_W; x += 20) {
          for (let y = 0; y < COVER_H; y += 20) {
            ctx.beginPath();
            ctx.arc(x, y, 0.6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Orbs
      if (showOrbs) {
        const drawOrb = (ox: number, oy: number, r: number, c: string) => {
          const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
          g.addColorStop(0, c);
          g.addColorStop(0.7, "transparent");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(ox, oy, r, 0, Math.PI * 2);
          ctx.fill();
        };
        drawOrb(1400, -60, 350, "rgba(13,223,114,0.06)");
        drawOrb(200, 450, 280, "rgba(29,57,43,0.08)");
      }

      // Background image
      const finishRender = () => {
        drawContent(ctx, exportMode);
      };

      if (bgSrc) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.save();
          ctx.globalAlpha = bgOpacity;
          const imgAspect = img.width / img.height;
          const coverAspect = COVER_W / COVER_H;
          let dw: number, dh: number;
          if (imgAspect > coverAspect) {
            dh = COVER_H * bgScale;
            dw = dh * imgAspect;
          } else {
            dw = COVER_W * bgScale;
            dh = dw / imgAspect;
          }
          ctx.drawImage(
            img,
            (COVER_W - dw) / 2 + bgOffsetX,
            (COVER_H - dh) / 2 + bgOffsetY,
            dw,
            dh
          );
          ctx.restore();
          finishRender();
        };
        img.src = bgSrc;
      } else {
        finishRender();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      bgSrc, bgScale, bgOffsetX, bgOffsetY, bgOpacity,
      eyebrow, headlinePre, headlineHighlight, headlinePost, description,
      tags, textScale, textX, textY, tagsX,
      showSafeZones, showDotMatrix, showOrbs,
    ]
  );

  function drawContent(ctx: CanvasRenderingContext2D, exportMode: boolean) {
    const s = textScale;
    const x = textX;
    const y = textY;

    // Eyebrow
    ctx.font = `600 ${Math.round(11 * s)}px 'JetBrains Mono', monospace`;
    ctx.fillStyle = "#0ddf72";
    ctx.textBaseline = "top";
    ctx.letterSpacing = `${2 * s}px`;
    ctx.fillText(eyebrow, x, y);
    ctx.letterSpacing = "0px";

    // Headline — multi-part with highlight
    const headlineBaseSize = Math.round(42 * s);
    const lineHeight = headlineBaseSize * 1.15;
    let curY = y + 28 * s;

    // Pre-highlight line
    if (headlinePre) {
      ctx.font = `800 ${headlineBaseSize}px Sora, system-ui, sans-serif`;
      ctx.fillStyle = "#ffffff";
      ctx.fillText(headlinePre, x, curY);
      curY += lineHeight;
    }

    // Highlight line (green)
    if (headlineHighlight) {
      ctx.font = `800 ${headlineBaseSize}px Sora, system-ui, sans-serif`;
      ctx.fillStyle = "#0ddf72";
      ctx.fillText(headlineHighlight, x, curY);
      curY += lineHeight;
    }

    // Post-highlight line (lighter)
    if (headlinePost) {
      ctx.font = `400 ${headlineBaseSize}px Sora, system-ui, sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillText(headlinePost, x, curY);
      curY += lineHeight;
    }

    // Description
    if (description) {
      ctx.font = `400 ${Math.round(14 * s)}px Sora, system-ui, sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      const lines = description.split("\n");
      let descY = curY + 8 * s;
      for (const line of lines) {
        ctx.fillText(line, x, descY);
        descY += 20 * s;
      }
    }

    // Right side: Skill tags
    drawTags(ctx, s);

    // Brand mark bottom-right
    ctx.font = `500 ${Math.round(13 * s)}px 'JetBrains Mono', monospace`;
    ctx.fillStyle = "rgba(13,223,114,0.35)";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText("szamowski.dev", COVER_W - 40, COVER_H - 50);
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    // Safe zones
    if (showSafeZones && !exportMode) {
      drawSafeZones(ctx);
    }
  }

  function drawTags(ctx: CanvasRenderingContext2D, s: number) {
    if (tags.length === 0) return;

    const tagSize = Math.round(12 * s);
    const tagPadX = 16 * s;
    const tagPadY = 8 * s;
    const tagGap = 10 * s;
    const rowGap = 10 * s;
    const maxRowWidth = 380 * s;
    const cornerR = 18 * s;
    const borderWidth = 1.2;

    ctx.font = `500 ${tagSize}px 'JetBrains Mono', monospace`;
    ctx.textBaseline = "middle";

    // Arrange tags into rows
    const rows: { text: string; w: number }[][] = [];
    let currentRow: { text: string; w: number }[] = [];
    let currentRowWidth = 0;

    for (const tag of tags) {
      const tw = ctx.measureText(tag).width + tagPadX * 2;
      if (currentRow.length > 0 && currentRowWidth + tw + tagGap > maxRowWidth) {
        rows.push(currentRow);
        currentRow = [];
        currentRowWidth = 0;
      }
      currentRow.push({ text: tag, w: tw });
      currentRowWidth += tw + tagGap;
    }
    if (currentRow.length > 0) rows.push(currentRow);

    // Center tags block vertically
    const totalH = rows.length * (tagSize + tagPadY * 2 + rowGap) - rowGap;
    let startY = (COVER_H - totalH) / 2 + 20;

    for (const row of rows) {
      // Right-align each row
      const rowWidth = row.reduce((sum, t) => sum + t.w + tagGap, -tagGap);
      let tx = tagsX + (maxRowWidth - rowWidth) / 2;

      for (const tag of row) {
        const th = tagSize + tagPadY * 2;

        // Rounded pill border
        ctx.strokeStyle = "rgba(13,223,114,0.25)";
        ctx.lineWidth = borderWidth;
        ctx.beginPath();
        ctx.roundRect(tx, startY, tag.w, th, cornerR);
        ctx.stroke();

        // Tag text
        ctx.fillStyle = "rgba(218,252,224,0.7)";
        ctx.fillText(tag.text, tx + tagPadX, startY + th / 2);

        tx += tag.w + tagGap;
      }

      startY += tagSize + tagPadY * 2 + rowGap;
    }
  }

  function drawSafeZones(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "rgba(255,60,60,0.12)";
    ctx.fillRect(AVATAR_ZONE.x, AVATAR_ZONE.y, AVATAR_ZONE.w, AVATAR_ZONE.h);

    ctx.strokeStyle = "rgba(255,60,60,0.3)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.arc(120, COVER_H + 20, 80, -Math.PI, 0);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = "500 11px monospace";
    ctx.fillStyle = "rgba(255,60,60,0.5)";
    ctx.textBaseline = "top";
    ctx.fillText("AVATAR ZONE", AVATAR_ZONE.x + 10, AVATAR_ZONE.y + 20);

    ctx.fillStyle = "rgba(255,180,0,0.06)";
    ctx.fillRect(0, 0, COVER_W, 40);
    ctx.fillRect(0, COVER_H - 30, COVER_W, 30);
    ctx.fillStyle = "rgba(255,180,0,0.3)";
    ctx.font = "500 10px monospace";
    ctx.fillText("MOBILE CROP", 10, 15);
  }

  useEffect(() => {
    render();
  }, [render]);

  function handleDownload() {
    // Re-render without safe zones
    const canvas = canvasRef.current;
    if (!canvas) return;
    const origSafe = showSafeZones;

    // Render export version
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = COVER_W;
    exportCanvas.height = COVER_H;
    const exportCtx = exportCanvas.getContext("2d");
    if (!exportCtx) return;

    // Copy current canvas content
    exportCtx.drawImage(canvas, 0, 0);

    // If safe zones were showing, re-render without them to a temp canvas
    if (origSafe) {
      setShowSafeZones(false);
      setTimeout(() => {
        const a = document.createElement("a");
        a.download = "linkedin_cover_photo.png";
        a.href = canvasRef.current!.toDataURL("image/png");
        a.click();
        setShowSafeZones(true);
      }, 150);
    } else {
      const a = document.createElement("a");
      a.download = "linkedin_cover_photo.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
    }
  }

  function handleReset() {
    setBgSrc(null);
    setBgScale(1);
    setBgOffsetX(0);
    setBgOffsetY(0);
    setBgOpacity(0.15);
    setEyebrow("STRATEGY CONSULTANT · FULLSTACK DEVELOPER");
    setHeadlinePre("I bridge the gap between");
    setHeadlineHighlight("marketing strategy");
    setHeadlinePost("and technical execution.");
    setDescription("15 years in digital performance. Self-taught developer.\nBuilding tools that turn data into decisions.");
    setTags(DEFAULT_TAGS);
    setTextScale(1);
    setTextX(300);
    setTextY(80);
    setTagsX(1100);
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  const layoutSliders = [
    { label: "Text Scale", value: textScale, min: 0.6, max: 1.5, step: 0.02, setter: setTextScale, display: `${textScale.toFixed(2)}x` },
    { label: "Text X", value: textX, min: 40, max: 600, step: 5, setter: setTextX, display: `${textX}px` },
    { label: "Text Y", value: textY, min: 20, max: 200, step: 5, setter: setTextY, display: `${textY}px` },
    { label: "Tags X", value: tagsX, min: 800, max: 1400, step: 5, setter: setTagsX, display: `${tagsX}px` },
  ];

  const bgSliders = bgSrc
    ? [
        { label: "BG Scale", value: bgScale, min: 0.5, max: 3, step: 0.05, setter: setBgScale, display: `${bgScale.toFixed(2)}x` },
        { label: "BG X", value: bgOffsetX, min: -500, max: 500, step: 5, setter: setBgOffsetX, display: `${bgOffsetX}px` },
        { label: "BG Y", value: bgOffsetY, min: -200, max: 200, step: 5, setter: setBgOffsetY, display: `${bgOffsetY}px` },
        { label: "BG Opacity", value: bgOpacity, min: 0, max: 1, step: 0.02, setter: setBgOpacity, display: `${Math.round(bgOpacity * 100)}%` },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#050a08]">
      <AdminNavbar />

      <div className="max-w-6xl mx-auto px-6 pt-24 pb-12">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-sm font-mono text-brand/70 uppercase tracking-wider">
            LinkedIn Cover Photo
          </h2>
          {saveStatus && (
            <span className="text-[10px] font-mono text-brand/40">{saveStatus}</span>
          )}
        </div>

        {/* Canvas preview */}
        <div className="mb-6">
          <canvas
            ref={canvasRef}
            className="w-full rounded-xl border border-brand/10"
            style={{ maxWidth: COVER_W / 2, aspectRatio: `${COVER_W}/${COVER_H}` }}
          />
          <div className="flex items-center gap-4 mt-3">
            <span className="text-white/20 text-xs font-mono">
              {COVER_W} x {COVER_H}
            </span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showSafeZones}
                onChange={(e) => setShowSafeZones(e.target.checked)}
                className="accent-brand"
              />
              <span className="text-xs text-white/40 font-mono">Safe zones</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showDotMatrix}
                onChange={(e) => setShowDotMatrix(e.target.checked)}
                className="accent-brand"
              />
              <span className="text-xs text-white/40 font-mono">Dot matrix</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOrbs}
                onChange={(e) => setShowOrbs(e.target.checked)}
                className="accent-brand"
              />
              <span className="text-xs text-white/40 font-mono">Orbs</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Text controls */}
          <div className="glass rounded-xl border border-white/5 p-5 space-y-3">
            <div className="text-[11px] text-brand/70 font-mono uppercase tracking-wider mb-3">
              Text Content
            </div>
            <div>
              <label className="block text-[11px] text-white/40 font-mono mb-1">Eyebrow</label>
              <input
                type="text"
                value={eyebrow}
                onChange={(e) => setEyebrow(e.target.value)}
                className="w-full bg-[#0a1510] border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-brand/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] text-white/40 font-mono mb-1">Headline (line 1)</label>
              <input
                type="text"
                value={headlinePre}
                onChange={(e) => setHeadlinePre(e.target.value)}
                className="w-full bg-[#0a1510] border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-brand/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] text-brand/60 font-mono mb-1">Highlight (green)</label>
              <input
                type="text"
                value={headlineHighlight}
                onChange={(e) => setHeadlineHighlight(e.target.value)}
                className="w-full bg-[#0a1510] border border-brand/20 rounded-lg px-3 py-2 text-brand text-sm font-bold font-mono focus:outline-none focus:border-brand/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] text-white/40 font-mono mb-1">Headline (line 3)</label>
              <input
                type="text"
                value={headlinePost}
                onChange={(e) => setHeadlinePost(e.target.value)}
                className="w-full bg-[#0a1510] border border-white/10 rounded-lg px-3 py-2 text-white/50 text-sm font-mono focus:outline-none focus:border-brand/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] text-white/40 font-mono mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-[#0a1510] border border-white/10 rounded-lg px-3 py-2 text-white/40 text-xs font-mono focus:outline-none focus:border-brand/50 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Tags & Layout */}
          <div className="space-y-6">
            <div className="glass rounded-xl border border-white/5 p-5 space-y-3">
              <div className="text-[11px] text-brand/70 font-mono uppercase tracking-wider mb-2">
                Skill Tags
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-brand/20 text-brand/70 text-[10px] font-mono"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-white/30 hover:text-red-400 ml-0.5 transition-colors"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTag()}
                  placeholder="Add tag..."
                  className="flex-1 bg-[#0a1510] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-brand/50 transition-colors"
                />
                <button
                  onClick={addTag}
                  className="text-brand/60 border border-brand/20 rounded-lg px-3 py-1.5 text-xs font-mono hover:border-brand/40 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="glass rounded-xl border border-white/5 p-5 space-y-3">
              <div className="text-[11px] text-brand/70 font-mono uppercase tracking-wider mb-2">
                Layout
              </div>
              {layoutSliders.map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[11px] text-white/40 font-mono">{s.label}</span>
                    <span className="text-[11px] text-brand font-mono">{s.display}</span>
                  </div>
                  <input
                    type="range"
                    min={s.min}
                    max={s.max}
                    step={s.step}
                    value={s.value}
                    onChange={(e) => s.setter(parseFloat(e.target.value))}
                    className="w-full h-1 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: "#0ddf72", background: "rgba(13,223,114,0.08)" }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* BG & Actions */}
          <div className="space-y-6">
            <div className="glass rounded-xl border border-white/5 p-5 space-y-3">
              <div className="text-[11px] text-brand/70 font-mono uppercase tracking-wider mb-2">
                Background Image
              </div>
              {!bgSrc ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onClick={() => {
                    const i = document.createElement("input");
                    i.type = "file";
                    i.accept = "image/*";
                    i.onchange = (e) => {
                      const f = (e.target as HTMLInputElement).files?.[0];
                      if (f) handleFile(f);
                    };
                    i.click();
                  }}
                  className="flex flex-col items-center justify-center gap-2 rounded-lg cursor-pointer transition-colors py-6"
                  style={{
                    border: `2px dashed ${dragOver ? "#0ddf72" : "rgba(13,223,114,0.15)"}`,
                    background: dragOver ? "rgba(13,223,114,0.04)" : "rgba(13,223,114,0.015)",
                  }}
                >
                  <span className="text-brand/40 text-xs font-mono">Drop or click to add BG</span>
                  <span className="text-white/15 text-[10px] font-mono">or Ctrl+V to paste</span>
                </div>
              ) : (
                <>
                  {bgSliders.map((s) => (
                    <div key={s.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-[11px] text-white/40 font-mono">{s.label}</span>
                        <span className="text-[11px] text-brand font-mono">{s.display}</span>
                      </div>
                      <input
                        type="range"
                        min={s.min}
                        max={s.max}
                        step={s.step}
                        value={s.value}
                        onChange={(e) => s.setter(parseFloat(e.target.value))}
                        className="w-full h-1 rounded-full appearance-none cursor-pointer"
                        style={{ accentColor: "#0ddf72", background: "rgba(13,223,114,0.08)" }}
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => setBgSrc(null)}
                    className="w-full text-xs font-mono text-white/30 border border-white/10 rounded-lg py-2 hover:text-red-400 hover:border-red-400/30 transition-colors"
                  >
                    Remove BG
                  </button>
                </>
              )}
            </div>

            <div className="glass rounded-xl border border-white/5 p-5 space-y-3">
              <div className="text-[11px] text-brand/70 font-mono uppercase tracking-wider mb-2">
                Export
              </div>
              <button
                onClick={handleDownload}
                className="w-full bg-brand text-[#050a08] font-bold py-3 rounded-lg text-sm font-mono hover:brightness-110 transition-all"
              >
                Download PNG
              </button>
              <button
                onClick={handleReset}
                className="w-full px-5 py-3 rounded-lg text-sm font-mono text-white/30 border border-white/10 hover:text-white/50 hover:border-white/20 transition-colors"
              >
                Reset All
              </button>
              <div className="border-t border-white/5 pt-3">
                <div className="text-[10px] text-white/20 font-mono space-y-1">
                  <p>Red zone = avatar overlap area</p>
                  <p>Yellow edges = mobile crop risk</p>
                  <p>Safe zones hidden on export</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
