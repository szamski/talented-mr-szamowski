"use client";

import { useState } from "react";
import { SLIDE_STYLES } from "@/lib/slide-templates";

interface ExportModalProps {
  slides: { id: string; html: string }[];
  projectName: string;
  onClose: () => void;
}

const FONTS_LINK =
  "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap";

export default function ExportModal({
  slides,
  projectName,
  onClose,
}: ExportModalProps) {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState("");

  /**
   * Render a slide in a real iframe (browser-native CSS) then capture via
   * html-to-image which uses SVG foreignObject — supports backdrop-filter,
   * background-clip:text, ::before pseudo-elements, etc.
   */
  async function renderSlideToBlob(
    html: string,
    width: number,
    height: number
  ): Promise<Blob> {
    const { toBlob } = await import("html-to-image");

    return new Promise((resolve, reject) => {
      const iframe = document.createElement("iframe");
      iframe.style.cssText = `position:fixed;top:-9999px;left:-9999px;width:${width}px;height:${height}px;border:none;`;

      const srcdoc = `<!DOCTYPE html><html><head>
        <style>${SLIDE_STYLES}</style>
        <link href="${FONTS_LINK}" rel="stylesheet">
      </head><body style="margin:0;overflow:hidden;">${html}</body></html>`;

      iframe.srcdoc = srcdoc;
      document.body.appendChild(iframe);

      iframe.onload = async () => {
        try {
          const iframeDoc =
            iframe.contentDocument || iframe.contentWindow?.document;
          if (!iframeDoc) throw new Error("Cannot access iframe document");

          // Wait for fonts to load inside the iframe
          await iframeDoc.fonts.ready;
          await new Promise((r) => setTimeout(r, 400));

          const slideEl = iframeDoc.querySelector(".slide") as HTMLElement;
          if (!slideEl) throw new Error("No .slide element found");

          const blob = await toBlob(slideEl, {
            width,
            height,
            pixelRatio: 1,
            cacheBust: true,
            skipAutoScale: true,
            includeQueryParams: true,
          });

          document.body.removeChild(iframe);

          if (!blob) throw new Error("toBlob returned null");
          resolve(blob);
        } catch (err) {
          document.body.removeChild(iframe);
          reject(err);
        }
      };
    });
  }

  /**
   * Fallback: render using html2canvas if html-to-image fails
   * (e.g. cross-origin font issues in some browsers)
   */
  async function renderSlideToCanvas(
    html: string,
    width: number,
    height: number
  ): Promise<HTMLCanvasElement> {
    const { default: html2canvas } = await import("html2canvas-pro");

    const container = document.createElement("div");
    container.style.cssText = `position:fixed;top:-9999px;left:-9999px;width:${width}px;height:${height}px;overflow:hidden;`;

    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;
    container.appendChild(wrapper.firstElementChild || wrapper);

    const styleEl = document.createElement("style");
    styleEl.textContent = SLIDE_STYLES;
    container.prepend(styleEl);

    // Load fonts in the main document
    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href = FONTS_LINK;
    container.prepend(fontLink);

    document.body.appendChild(container);

    await document.fonts.ready;
    await new Promise((r) => setTimeout(r, 300));

    const canvas = await html2canvas(
      container.querySelector(".slide") || container,
      {
        width,
        height,
        scale: 1,
        backgroundColor: "#050a08",
        useCORS: true,
        logging: false,
      }
    );

    document.body.removeChild(container);
    return canvas;
  }

  async function getSlideBlob(
    html: string,
    width: number,
    height: number
  ): Promise<Blob> {
    try {
      return await renderSlideToBlob(html, width, height);
    } catch {
      // Fallback to html2canvas
      const canvas = await renderSlideToCanvas(html, width, height);
      return new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), "image/png")
      );
    }
  }

  async function exportPNG() {
    setExporting(true);

    for (let i = 0; i < slides.length; i++) {
      setProgress(`Rendering slide ${i + 1} / ${slides.length}...`);
      const blob = await getSlideBlob(slides[i].html, 1080, 1350);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectName.replace(/\s+/g, "_")}_${String(i + 1).padStart(2, "0")}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }

    setProgress("Done!");
    setTimeout(() => {
      setExporting(false);
      setProgress("");
    }, 1500);
  }

  async function exportPDF() {
    setExporting(true);
    const { jsPDF } = await import("jspdf");

    // LinkedIn carousel: 1080x1350 = 4:5 ratio
    const pxW = 1080;
    const pxH = 1350;
    // Use px as unit for pixel-perfect output
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [pxW, pxH],
      hotfixes: ["px_scaling"],
    });

    for (let i = 0; i < slides.length; i++) {
      setProgress(`Rendering slide ${i + 1} / ${slides.length}...`);
      if (i > 0) pdf.addPage([pxW, pxH]);

      const blob = await getSlideBlob(slides[i].html, pxW, pxH);
      const dataUrl = await blobToDataUrl(blob);
      pdf.addImage(dataUrl, "PNG", 0, 0, pxW, pxH);
    }

    setProgress("Generating PDF...");
    pdf.save(`${projectName.replace(/\s+/g, "_")}.pdf`);

    setProgress("Done!");
    setTimeout(() => {
      setExporting(false);
      setProgress("");
    }, 1500);
  }

  function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 max-w-md w-[90%] text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {exporting ? (
          <>
            <div className="w-10 h-10 border-3 border-white/10 border-t-brand rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-white/60 font-mono">{progress}</p>
          </>
        ) : (
          <>
            <h3 className="text-sm font-mono text-brand font-semibold mb-2">
              Export
            </h3>
            <p className="text-xs text-white/30 font-mono mb-6">
              {slides.length} slide{slides.length !== 1 ? "s" : ""} will be
              exported
            </p>
            <div className="flex gap-3">
              <button
                onClick={exportPNG}
                className="flex-1 bg-brand text-[#080818] font-bold py-3 rounded-lg text-sm font-mono hover:brightness-110 transition-all"
              >
                PNG (individual)
              </button>
              <button
                onClick={exportPDF}
                className="flex-1 bg-[#5865f2] text-white font-bold py-3 rounded-lg text-sm font-mono hover:bg-[#6d78f5] transition-all"
              >
                PDF (combined)
              </button>
            </div>
            <button
              onClick={onClose}
              className="mt-4 text-xs font-mono text-white/30 hover:text-white/50 transition-colors"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
