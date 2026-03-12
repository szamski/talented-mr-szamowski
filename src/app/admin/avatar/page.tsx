"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import AdminNavbar from "@/components/admin/AdminNavbar";

/* ─── Personal Avatar Generator ─── */

function PersonalAvatar() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [scale, setScale] = useState(1.2);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(-15);
  const [ringWeight, setRingWeight] = useState(3);
  const [ringGap, setRingGap] = useState(20);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => setAvatarSrc(e.target?.result as string);
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

  const render = useCallback(() => {
    if (!avatarSrc) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = 1080;
    canvas.width = W;
    canvas.height = W;

    const bg = ctx.createLinearGradient(0, 0, W * 0.6, W);
    bg.addColorStop(0, "#050a08");
    bg.addColorStop(0.45, "#071210");
    bg.addColorStop(0.75, "#0a1a14");
    bg.addColorStop(1, "#050a08");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, W);

    ctx.fillStyle = "rgba(13,223,114,0.025)";
    for (let x = 0; x < W; x += 24) {
      for (let y = 0; y < W; y += 24) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const drawOrb = (ox: number, oy: number, r: number, c: string) => {
      const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
      g.addColorStop(0, c);
      g.addColorStop(0.7, "transparent");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(ox, oy, r, 0, Math.PI * 2);
      ctx.fill();
    };
    drawOrb(850, -50, 350, "rgba(13,223,114,0.10)");
    drawOrb(-30, 900, 280, "rgba(29,57,43,0.12)");
    drawOrb(750, 750, 180, "rgba(13,223,114,0.05)");

    const particles: [number, number, number, string][] = [
      [200, 90, 3, "rgba(13,223,114,0.2)"],
      [920, 250, 2, "rgba(13,223,114,0.12)"],
      [280, 920, 2, "rgba(13,223,114,0.15)"],
      [820, 130, 3, "rgba(29,57,43,0.15)"],
    ];
    particles.forEach(([x, y, r, c]) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });

    const cx = W / 2;
    const cy = W / 2;
    const avatarR = 400;
    const ringR = avatarR + ringGap;

    const gl = ctx.createRadialGradient(cx, cy, avatarR - 50, cx, cy, ringR + 40);
    gl.addColorStop(0, "rgba(13,223,114,0.03)");
    gl.addColorStop(1, "transparent");
    ctx.fillStyle = gl;
    ctx.beginPath();
    ctx.arc(cx, cy, ringR + 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(13,223,114,0.10)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = ringWeight;
    ctx.strokeStyle = "#0ddf72";
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, -Math.PI * 0.7, -Math.PI * 0.1);
    ctx.stroke();
    ctx.strokeStyle = "rgba(13,223,114,0.35)";
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, -Math.PI * 0.1, Math.PI * 0.2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(13,223,114,0.08)";
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, Math.PI * 0.2, Math.PI * 0.5);
    ctx.stroke();

    ctx.strokeStyle = "rgba(13,223,114,0.04)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, avatarR + 8, 0, Math.PI * 2);
    ctx.stroke();

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, avatarR, 0, Math.PI * 2);
      ctx.clip();
      const dw = avatarR * 2 * scale;
      const dh = avatarR * 2 * scale;
      ctx.drawImage(img, cx - dw / 2 + offsetX, cy - dh / 2 + offsetY, dw, dh);
      ctx.restore();
    };
    img.src = avatarSrc;
  }, [avatarSrc, scale, offsetX, offsetY, ringWeight, ringGap]);

  useEffect(() => {
    render();
  }, [render]);

  function handleDownload() {
    const c = canvasRef.current;
    if (!c) return;
    const a = document.createElement("a");
    a.download = "avatar_branded.png";
    a.href = c.toDataURL("image/png");
    a.click();
  }

  function handleReset() {
    setAvatarSrc(null);
    setScale(1.2);
    setOffsetX(0);
    setOffsetY(-15);
    setRingGap(20);
    setRingWeight(3);
  }

  const sliders = [
    { label: "Scale", value: scale, min: 0.6, max: 2.5, step: 0.01, setter: setScale, display: `${scale.toFixed(2)}x` },
    { label: "X Offset", value: offsetX, min: -250, max: 250, step: 1, setter: setOffsetX, display: `${offsetX}px` },
    { label: "Y Offset", value: offsetY, min: -250, max: 250, step: 1, setter: setOffsetY, display: `${offsetY}px` },
    { label: "Ring Weight", value: ringWeight, min: 1, max: 8, step: 0.5, setter: setRingWeight, display: `${ringWeight}px` },
    { label: "Ring Gap", value: ringGap, min: 5, max: 60, step: 1, setter: setRingGap, display: `${ringGap}px` },
  ];

  return (
    <>
      {!avatarSrc ? (
        <div className="flex items-center justify-center">
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
            className="flex flex-col items-center justify-center gap-4 rounded-2xl cursor-pointer transition-colors"
            style={{
              width: 400,
              height: 280,
              border: `2px dashed ${dragOver ? "#0ddf72" : "rgba(13,223,114,0.15)"}`,
              background: dragOver ? "rgba(13,223,114,0.04)" : "rgba(13,223,114,0.015)",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="23" stroke="rgba(13,223,114,0.25)" strokeWidth="2" />
              <path d="M24 16v16M16 24h16" stroke="#0ddf72" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="text-brand/50 text-sm font-mono">
              Drop, click, or Ctrl+V to paste
            </span>
            <span className="text-white/20 text-xs font-mono">1080 x 1080 output</span>
          </div>
        </div>
      ) : (
        <div className="flex gap-8 items-start">
          <div className="flex-shrink-0">
            <canvas
              ref={canvasRef}
              className="rounded-xl border border-brand/10"
              style={{ width: 420, height: 420 }}
            />
          </div>
          <div className="flex-1 min-w-[280px] space-y-4">
            <div className="glass rounded-xl border border-white/5 p-5 space-y-4">
              {sliders.map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between mb-1.5">
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
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 bg-brand text-[#050a08] font-bold py-3 rounded-lg text-sm font-mono hover:brightness-110 transition-all"
              >
                Download PNG
              </button>
              <button
                onClick={handleReset}
                className="px-5 py-3 rounded-lg text-sm font-mono text-white/30 border border-white/10 hover:text-white/50 hover:border-white/20 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Company Avatar Generator (S .dev logo) ─── */

function CompanyAvatar() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [letterText, setLetterText] = useState("S");
  const [suffixText, setSuffixText] = useState(".dev");
  const [pillWidth, setPillWidth] = useState(420);
  const [pillHeight, setPillHeight] = useState(180);
  const [letterSize, setLetterSize] = useState(110);
  const [suffixSize, setSuffixSize] = useState(72);
  const [cornerRadius, setCornerRadius] = useState(90);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = 1080;
    canvas.width = W;
    canvas.height = W;

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, W * 0.6, W);
    bg.addColorStop(0, "#050a08");
    bg.addColorStop(0.45, "#071210");
    bg.addColorStop(0.75, "#0a1a14");
    bg.addColorStop(1, "#050a08");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, W);

    // Dot matrix
    ctx.fillStyle = "rgba(13,223,114,0.02)";
    for (let x = 0; x < W; x += 24) {
      for (let y = 0; y < W; y += 24) {
        ctx.beginPath();
        ctx.arc(x, y, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Subtle orbs
    const drawOrb = (ox: number, oy: number, r: number, c: string) => {
      const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
      g.addColorStop(0, c);
      g.addColorStop(0.7, "transparent");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(ox, oy, r, 0, Math.PI * 2);
      ctx.fill();
    };
    drawOrb(800, 100, 300, "rgba(13,223,114,0.06)");
    drawOrb(200, 800, 250, "rgba(29,57,43,0.08)");

    // Curly braces decorations (subtle, like code)
    ctx.font = "300 120px 'JetBrains Mono', monospace";
    ctx.fillStyle = "rgba(13,223,114,0.04)";
    ctx.textBaseline = "middle";
    ctx.fillText("{", 140, W / 2);
    ctx.textAlign = "right";
    ctx.fillText("}", W - 140, W / 2);
    ctx.textAlign = "left";

    const cx = W / 2;
    const cy = W / 2;

    // Main pill shape
    const pillX = cx - pillWidth / 2;
    const pillY = cy - pillHeight / 2;
    const letterBoxWidth = pillHeight; // Square for the letter

    // Glow behind pill
    const gl = ctx.createRadialGradient(cx, cy, 0, cx, cy, pillWidth * 0.8);
    gl.addColorStop(0, "rgba(13,223,114,0.06)");
    gl.addColorStop(1, "transparent");
    ctx.fillStyle = gl;
    ctx.beginPath();
    ctx.arc(cx, cy, pillWidth * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Pill outline (subtle)
    ctx.strokeStyle = "rgba(13,223,114,0.12)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillWidth, pillHeight, cornerRadius);
    ctx.stroke();

    // Green section (left part for letter)
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillWidth, pillHeight, cornerRadius);
    ctx.clip();

    // Green bg for letter area
    const greenGrad = ctx.createLinearGradient(pillX, pillY, pillX + letterBoxWidth, pillY + pillHeight);
    greenGrad.addColorStop(0, "#0ddf72");
    greenGrad.addColorStop(1, "#0bc85f");
    ctx.fillStyle = greenGrad;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, letterBoxWidth, pillHeight, [cornerRadius, 0, 0, cornerRadius]);
    ctx.fill();

    // Letter on green
    ctx.font = `700 ${letterSize}px Sora, system-ui, sans-serif`;
    ctx.fillStyle = "#050a08";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(letterText, pillX + letterBoxWidth / 2, cy + 4);

    // Suffix on dark area
    ctx.font = `500 ${suffixSize}px 'JetBrains Mono', monospace`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(suffixText, pillX + letterBoxWidth + (pillWidth - letterBoxWidth) / 2, cy + 4);

    ctx.restore();

    // Small particles
    const particles: [number, number, number, string][] = [
      [280, 200, 3, "rgba(13,223,114,0.15)"],
      [820, 350, 2, "rgba(13,223,114,0.10)"],
      [350, 820, 2, "rgba(13,223,114,0.12)"],
      [750, 780, 3, "rgba(29,57,43,0.12)"],
    ];
    particles.forEach(([x, y, r, c]) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [letterText, suffixText, pillWidth, pillHeight, letterSize, suffixSize, cornerRadius]);

  useEffect(() => {
    render();
  }, [render]);

  function handleDownload() {
    const c = canvasRef.current;
    if (!c) return;
    const a = document.createElement("a");
    a.download = "company_avatar.png";
    a.href = c.toDataURL("image/png");
    a.click();
  }

  const sliders = [
    { label: "Pill Width", value: pillWidth, min: 300, max: 600, step: 5, setter: setPillWidth, display: `${pillWidth}px` },
    { label: "Pill Height", value: pillHeight, min: 120, max: 280, step: 5, setter: setPillHeight, display: `${pillHeight}px` },
    { label: "Letter Size", value: letterSize, min: 60, max: 180, step: 2, setter: setLetterSize, display: `${letterSize}px` },
    { label: "Suffix Size", value: suffixSize, min: 40, max: 120, step: 2, setter: setSuffixSize, display: `${suffixSize}px` },
    { label: "Corner Radius", value: cornerRadius, min: 10, max: 140, step: 5, setter: setCornerRadius, display: `${cornerRadius}px` },
  ];

  return (
    <div className="flex gap-8 items-start">
      <div className="flex-shrink-0">
        <canvas
          ref={canvasRef}
          className="rounded-xl border border-brand/10"
          style={{ width: 420, height: 420 }}
        />
      </div>
      <div className="flex-1 min-w-[280px] space-y-4">
        <div className="glass rounded-xl border border-white/5 p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-white/40 font-mono mb-1">Letter</label>
              <input
                type="text"
                value={letterText}
                onChange={(e) => setLetterText(e.target.value.slice(0, 3))}
                maxLength={3}
                className="w-full bg-[#0a1510] border border-brand/20 rounded-lg px-3 py-2 text-brand text-lg font-bold font-mono text-center focus:outline-none focus:border-brand/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] text-white/40 font-mono mb-1">Suffix</label>
              <input
                type="text"
                value={suffixText}
                onChange={(e) => setSuffixText(e.target.value)}
                className="w-full bg-[#0a1510] border border-white/10 rounded-lg px-3 py-2 text-white text-lg font-mono text-center focus:outline-none focus:border-brand/50 transition-colors"
              />
            </div>
          </div>
          {sliders.map((s) => (
            <div key={s.label}>
              <div className="flex justify-between mb-1.5">
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
        <button
          onClick={handleDownload}
          className="w-full bg-brand text-[#050a08] font-bold py-3 rounded-lg text-sm font-mono hover:brightness-110 transition-all"
        >
          Download PNG
        </button>
      </div>
    </div>
  );
}

/* ─── Page ─── */

export default function AvatarGeneratorPage() {
  const [tab, setTab] = useState<"personal" | "company">("personal");

  return (
    <div className="min-h-screen bg-[#050a08]">
      <AdminNavbar />

      <div className="max-w-5xl mx-auto px-6 pt-24 pb-12">
        {/* Tab switcher */}
        <div className="flex items-center gap-6 mb-8">
          <button
            onClick={() => setTab("personal")}
            className={`text-sm font-mono uppercase tracking-wider transition-colors ${
              tab === "personal" ? "text-brand" : "text-white/30 hover:text-white/50"
            }`}
          >
            Personal Avatar
          </button>
          <button
            onClick={() => setTab("company")}
            className={`text-sm font-mono uppercase tracking-wider transition-colors ${
              tab === "company" ? "text-brand" : "text-white/30 hover:text-white/50"
            }`}
          >
            Company Avatar
          </button>
        </div>

        {tab === "personal" ? <PersonalAvatar /> : <CompanyAvatar />}
      </div>
    </div>
  );
}
