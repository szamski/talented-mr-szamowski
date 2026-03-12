"use client";

import { useState, useEffect, useCallback } from "react";
import ImageManager from "./ImageManager";

interface SlideEditorPanelProps {
  slide: { id: string; html: string };
  slideIndex: number;
  totalSlides: number;
  onUpdate: (html: string) => void;
  onClose: () => void;
}

interface EditableField {
  selector: string;
  label: string;
  value: string;
  type: "label" | "heading" | "body" | "pills" | "card" | "numbered" | "stat" | "url";
}

interface FontSizeEntry {
  label: string;
  current: number;
  selector: string;
  index: number;
}

function getDoc(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

function parseEditableFields(html: string): EditableField[] {
  const doc = getDoc(html);
  const fields: EditableField[] = [];

  // Labels
  doc.querySelectorAll(".label").forEach((el, i) => {
    fields.push({
      selector: `label:${i}`,
      label: "Label",
      value: el.textContent || "",
      type: "label",
    });
  });

  // Headings
  doc.querySelectorAll("h1, h2").forEach((el, i) => {
    const tag = el.tagName.toLowerCase();
    fields.push({
      selector: `${tag}:${i}`,
      label: tag.toUpperCase(),
      value: el.innerHTML,
      type: "heading",
    });
  });

  // Body text
  doc.querySelectorAll(".body-text").forEach((el, i) => {
    fields.push({
      selector: `body-text:${i}`,
      label: "Body text",
      value: el.innerHTML,
      type: "body",
    });
  });

  // Pills
  const pills = doc.querySelectorAll(".pill");
  if (pills.length) {
    fields.push({
      selector: "pills",
      label: "Pills (comma separated)",
      value: [...pills].map((p) => p.textContent).join(", "),
      type: "pills",
    });
  }

  // Stat cards (Results template) — .mc containing .stat-number
  const statCards = doc.querySelectorAll(".mc");
  let regularCardIndex = 0;
  statCards.forEach((el) => {
    const statNum = el.querySelector(".stat-number");
    if (statNum) {
      // This is a stat card — parse specially
      const titleDiv = el.querySelector("div > div:not(.stat-number):not(.stat-label)");
      const labelDiv = el.querySelector(".stat-label");
      const num = statNum.textContent || "";
      const title = titleDiv?.textContent || "";
      const label = labelDiv?.textContent || "";
      const idx = fields.filter((f) => f.type === "stat").length;
      fields.push({
        selector: `stat:${idx}`,
        label: `Stat ${idx + 1}`,
        value: `${num}\n${title}\n${label}`,
        type: "stat",
      });
    } else {
      // Regular glass card
      const texts: string[] = [];
      el.querySelectorAll("div").forEach((d) => {
        const text = d.textContent?.trim();
        if (text && !d.querySelector("div")) texts.push(text);
      });
      if (texts.length) {
        fields.push({
          selector: `mc:${regularCardIndex}`,
          label: `Card ${regularCardIndex + 1}`,
          value: texts.join("\n"),
          type: "card",
        });
        regularCardIndex++;
      }
    }
  });

  // Numbered items (Challenge template) — flex rows with .glow-dot
  const slideDiv = doc.querySelector(".slide");
  if (slideDiv) {
    // Match flex rows containing a glow-dot (challenge points)
    slideDiv.querySelectorAll(".glow-dot").forEach((dot, i) => {
      const row = dot.parentElement;
      if (!row) return;
      const contentDiv = row.querySelector("div:not(.glow-dot)");
      if (!contentDiv) return;
      const innerDivs = contentDiv.querySelectorAll("div");
      const title = innerDivs[0]?.textContent || "";
      const subtitle = innerDivs[1]?.textContent || "";
      fields.push({
        selector: `numbered:${i}`,
        label: `Point ${i + 1}`,
        value: title + (subtitle ? "\n" + subtitle : ""),
        type: "numbered",
      });
    });

    // Fallback: flex rows with gap:16px that weren't already caught
    if (!fields.some((f) => f.type === "numbered")) {
      slideDiv
        .querySelectorAll('[style*="display:flex"][style*="gap:16px"]')
        .forEach((row, i) => {
          const divs = row.querySelectorAll("div div");
          if (divs.length >= 1) {
            const title = divs[0]?.textContent || "";
            const subtitle = divs[1]?.textContent || "";
            fields.push({
              selector: `numbered:${i}`,
              label: `Item ${i + 1}`,
              value: title + (subtitle ? "\n" + subtitle : ""),
              type: "numbered",
            });
          }
        });
    }
  }

  // URL-like text (CTA template) — monospace colored links at bottom
  if (slideDiv) {
    slideDiv
      .querySelectorAll('[style*="letter-spacing:0.1em"]')
      .forEach((el, i) => {
        fields.push({
          selector: `url:${i}`,
          label: "URL / Link text",
          value: el.textContent || "",
          type: "url",
        });
      });
  }

  return fields;
}

function parseFontSizes(html: string): FontSizeEntry[] {
  const doc = getDoc(html);
  const sizes: FontSizeEntry[] = [];

  // Headings
  doc.querySelectorAll("h1, h2").forEach((el, i) => {
    const tag = el.tagName.toLowerCase();
    const fs = (el as HTMLElement).style.fontSize;
    sizes.push({
      selector: tag,
      index: i,
      label: tag.toUpperCase(),
      current: parseInt(fs) || (tag === "h1" ? 60 : 44),
    });
  });

  // Body text
  doc.querySelectorAll(".body-text").forEach((el, i) => {
    const fs = (el as HTMLElement).style.fontSize;
    sizes.push({
      selector: ".body-text",
      index: i,
      label: "Body text",
      current: parseInt(fs) || 19,
    });
  });

  // Pills
  const pills = doc.querySelectorAll(".pill");
  if (pills.length) {
    sizes.push({
      selector: ".pill",
      index: 0,
      label: "Pills",
      current: parseInt((pills[0] as HTMLElement).style.fontSize) || 14,
    });
  }

  // Label
  const labels = doc.querySelectorAll(".label");
  if (labels.length) {
    sizes.push({
      selector: ".label",
      index: 0,
      label: "Label",
      current: parseInt((labels[0] as HTMLElement).style.fontSize) || 12,
    });
  }

  // Stat numbers
  const statNums = doc.querySelectorAll(".stat-number");
  if (statNums.length) {
    sizes.push({
      selector: ".stat-number",
      index: 0,
      label: "Stat number",
      current: parseInt((statNums[0] as HTMLElement).style.fontSize) || 64,
    });
  }

  // Stat labels
  const statLabels = doc.querySelectorAll(".stat-label");
  if (statLabels.length) {
    sizes.push({
      selector: ".stat-label",
      index: 0,
      label: "Stat label",
      current: parseInt((statLabels[0] as HTMLElement).style.fontSize) || 18,
    });
  }

  // Challenge point titles (divs inside glow-dot rows)
  const glowDots = doc.querySelectorAll(".glow-dot");
  if (glowDots.length) {
    const firstRow = glowDots[0]?.parentElement;
    const titleDiv = firstRow?.querySelector("div:not(.glow-dot) > div:first-child") as HTMLElement | null;
    if (titleDiv) {
      sizes.push({
        selector: ".point-title",
        index: 0,
        label: "Point title",
        current: parseInt(titleDiv.style.fontSize) || 19,
      });
    }
    const descDiv = firstRow?.querySelector("div:not(.glow-dot) > div:nth-child(2)") as HTMLElement | null;
    if (descDiv) {
      sizes.push({
        selector: ".point-desc",
        index: 0,
        label: "Point desc",
        current: parseInt(descDiv.style.fontSize) || 15,
      });
    }
  }

  // Card title (first div in .mc without stat-number)
  const mcs = doc.querySelectorAll(".mc");
  const regularMc = [...mcs].find((mc) => !mc.querySelector(".stat-number"));
  if (regularMc) {
    const cardTitle = regularMc.querySelector("div:not([class])") as HTMLElement | null;
    if (cardTitle && !cardTitle.querySelector("div")) {
      sizes.push({
        selector: ".mc-title",
        index: 0,
        label: "Card title",
        current: parseInt(cardTitle.style.fontSize) || 22,
      });
    }
    const cardDesc = regularMc.querySelectorAll("div:not([class])");
    const descEl = cardDesc.length > 1 ? (cardDesc[1] as HTMLElement) : null;
    if (descEl && !descEl.querySelector("div")) {
      sizes.push({
        selector: ".mc-desc",
        index: 0,
        label: "Card desc",
        current: parseInt(descEl.style.fontSize) || 16,
      });
    }
  }

  return sizes;
}

function applyFieldsToHtml(
  html: string,
  fields: EditableField[],
  values: string[]
): string {
  const doc = getDoc(html);

  fields.forEach((f, fi) => {
    const val = values[fi];
    if (val === undefined) return;

    if (f.type === "label") {
      const els = doc.querySelectorAll(".label");
      const i = parseInt(f.selector.split(":")[1]);
      if (els[i]) els[i].textContent = val;
    } else if (f.type === "heading") {
      const tag = f.selector.split(":")[0];
      const i = parseInt(f.selector.split(":")[1]);
      const els = doc.querySelectorAll(tag);
      if (els[i]) els[i].innerHTML = val;
    } else if (f.type === "body") {
      const i = parseInt(f.selector.split(":")[1]);
      const els = doc.querySelectorAll(".body-text");
      if (els[i]) els[i].innerHTML = val;
    } else if (f.type === "pills") {
      const pills = doc.querySelectorAll(".pill");
      const newPills = val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const parent = pills[0]?.parentElement;
      if (parent) {
        pills.forEach((p) => p.remove());
        newPills.forEach((text) => {
          const span = doc.createElement("span");
          span.className = "pill";
          span.textContent = text;
          parent.appendChild(span);
        });
      }
    } else if (f.type === "stat") {
      // Stat card: line 0 = number, line 1 = title, line 2 = label
      const i = parseInt(f.selector.split(":")[1]);
      const mcsWithStat = [...doc.querySelectorAll(".mc")].filter((mc) =>
        mc.querySelector(".stat-number")
      );
      const mc = mcsWithStat[i];
      if (mc) {
        const lines = val.split("\n");
        const statNum = mc.querySelector(".stat-number");
        if (statNum) statNum.textContent = lines[0] || "";
        // Title is the div inside the wrapper that isn't stat-number or stat-label
        const wrapper = mc.querySelector("div:not(.stat-number):has(> div)");
        if (wrapper) {
          const titleDiv = wrapper.querySelector("div:not(.stat-label)");
          const labelDiv = wrapper.querySelector(".stat-label");
          if (titleDiv) titleDiv.textContent = lines[1] || "";
          if (labelDiv) labelDiv.textContent = lines[2] || "";
        }
      }
    } else if (f.type === "card") {
      const i = parseInt(f.selector.split(":")[1]);
      // Regular cards (no stat-number)
      const regularMcs = [...doc.querySelectorAll(".mc")].filter(
        (mc) => !mc.querySelector(".stat-number")
      );
      const mc = regularMcs[i];
      if (mc) {
        const lines = val.split("\n");
        const innerDivs: Element[] = [];
        mc.querySelectorAll("div").forEach((d) => {
          if (!d.querySelector("div") && d.textContent?.trim()) {
            innerDivs.push(d);
          }
        });
        lines.forEach((line, li) => {
          if (innerDivs[li]) innerDivs[li].textContent = line;
        });
      }
    } else if (f.type === "numbered") {
      const i = parseInt(f.selector.split(":")[1]);
      const glowDots = doc.querySelectorAll(".glow-dot");
      if (glowDots[i]) {
        const row = glowDots[i].parentElement;
        if (row) {
          const contentDiv = row.querySelector("div:not(.glow-dot)");
          if (contentDiv) {
            const innerDivs = contentDiv.querySelectorAll("div");
            const lines = val.split("\n");
            if (innerDivs[0]) innerDivs[0].textContent = lines[0] || "";
            if (innerDivs[1] && lines[1] !== undefined) innerDivs[1].textContent = lines[1];
          }
        }
      }
    } else if (f.type === "url") {
      const i = parseInt(f.selector.split(":")[1]);
      const els = doc.querySelectorAll('[style*="letter-spacing:0.1em"]');
      if (els[i]) els[i].textContent = val;
    }
  });

  const serializer = new XMLSerializer();
  let result =
    "<!DOCTYPE html>" + serializer.serializeToString(doc.documentElement);
  result = result.replace(/ xmlns="http:\/\/www.w3.org\/1999\/xhtml"/g, "");

  const bodyMatch = result.match(/<body[^>]*>([\s\S]*)<\/body>/);
  return bodyMatch ? bodyMatch[1] : result;
}

// Helper: set font-size with !important so it beats stylesheet !important rules
function setFontSize(el: HTMLElement, size: number) {
  el.style.setProperty("font-size", size + "px", "important");
}

function applyFontSizeToHtml(
  html: string,
  fsEntry: FontSizeEntry,
  newSize: number
): string {
  const doc = getDoc(html);

  if (fsEntry.selector === "h1" || fsEntry.selector === "h2") {
    const els = doc.querySelectorAll(fsEntry.selector);
    if (els[fsEntry.index]) setFontSize(els[fsEntry.index] as HTMLElement, newSize);
  } else if (fsEntry.selector === ".body-text") {
    const els = doc.querySelectorAll(".body-text");
    if (els[fsEntry.index]) setFontSize(els[fsEntry.index] as HTMLElement, newSize);
  } else if (fsEntry.selector === ".pill") {
    doc.querySelectorAll(".pill").forEach((p) => setFontSize(p as HTMLElement, newSize));
  } else if (fsEntry.selector === ".label") {
    doc.querySelectorAll(".label").forEach((el) => setFontSize(el as HTMLElement, newSize));
  } else if (fsEntry.selector === ".stat-number") {
    doc.querySelectorAll(".stat-number").forEach((el) => setFontSize(el as HTMLElement, newSize));
  } else if (fsEntry.selector === ".stat-label") {
    doc.querySelectorAll(".stat-label").forEach((el) => setFontSize(el as HTMLElement, newSize));
  } else if (fsEntry.selector === ".point-title") {
    doc.querySelectorAll(".glow-dot").forEach((dot) => {
      const row = dot.parentElement;
      const titleDiv = row?.querySelector("div:not(.glow-dot) > div:first-child") as HTMLElement | null;
      if (titleDiv) setFontSize(titleDiv, newSize);
    });
  } else if (fsEntry.selector === ".point-desc") {
    doc.querySelectorAll(".glow-dot").forEach((dot) => {
      const row = dot.parentElement;
      const descDiv = row?.querySelector("div:not(.glow-dot) > div:nth-child(2)") as HTMLElement | null;
      if (descDiv) setFontSize(descDiv, newSize);
    });
  } else if (fsEntry.selector === ".mc-title") {
    [...doc.querySelectorAll(".mc")]
      .filter((mc) => !mc.querySelector(".stat-number"))
      .forEach((mc) => {
        const divs = mc.querySelectorAll("div");
        divs.forEach((d) => {
          if (!d.querySelector("div") && d.textContent?.trim()) {
            setFontSize(d as HTMLElement, newSize);
            return;
          }
        });
      });
  } else if (fsEntry.selector === ".mc-desc") {
    [...doc.querySelectorAll(".mc")]
      .filter((mc) => !mc.querySelector(".stat-number"))
      .forEach((mc) => {
        const leafDivs: HTMLElement[] = [];
        mc.querySelectorAll("div").forEach((d) => {
          if (!d.querySelector("div") && d.textContent?.trim()) {
            leafDivs.push(d as HTMLElement);
          }
        });
        if (leafDivs[1]) setFontSize(leafDivs[1], newSize);
      });
  }

  const serializer = new XMLSerializer();
  let result =
    "<!DOCTYPE html>" + serializer.serializeToString(doc.documentElement);
  result = result.replace(/ xmlns="http:\/\/www.w3.org\/1999\/xhtml"/g, "");
  const bodyMatch = result.match(/<body[^>]*>([\s\S]*)<\/body>/);
  return bodyMatch ? bodyMatch[1] : result;
}

export default function SlideEditorPanel({
  slide,
  slideIndex,
  totalSlides,
  onUpdate,
  onClose,
}: SlideEditorPanelProps) {
  const [fields, setFields] = useState<EditableField[]>([]);
  const [values, setValues] = useState<string[]>([]);
  const [fontSizes, setFontSizes] = useState<FontSizeEntry[]>([]);
  const [rawMode, setRawMode] = useState(false);
  const [rawHtml, setRawHtml] = useState("");

  useEffect(() => {
    const parsed = parseEditableFields(slide.html);
    setFields(parsed);
    setValues(parsed.map((f) => f.value));
    setFontSizes(parseFontSizes(slide.html));
    setRawHtml(slide.html);
  }, [slide.html, slide.id]);

  const applyFields = useCallback(() => {
    const newHtml = applyFieldsToHtml(slide.html, fields, values);
    onUpdate(newHtml);
  }, [slide.html, fields, values, onUpdate]);

  function handleFieldChange(idx: number, val: string) {
    const newValues = [...values];
    newValues[idx] = val;
    setValues(newValues);
  }

  function handleFieldBlur() {
    applyFields();
  }

  function handleFontSizeChange(fsIdx: number, delta: number) {
    const fs = fontSizes[fsIdx];
    if (!fs) return;
    const newSize = Math.max(8, fs.current + delta);
    const newHtml = applyFontSizeToHtml(slide.html, fs, newSize);
    onUpdate(newHtml);
  }

  function handleRawSave() {
    onUpdate(rawHtml);
    setRawMode(false);
  }

  // Group fields by type for better UI
  const fieldHint = (field: EditableField) => {
    if (field.type === "stat") return "Line 1: number, Line 2: title, Line 3: description";
    if (field.type === "numbered") return "Line 1: title, Line 2: description";
    if (field.type === "card") return "Each line = separate text element";
    return undefined;
  };

  return (
    <div className="fixed top-16 right-0 w-[560px] h-[calc(100vh-4rem)] bg-[rgba(5,10,8,0.95)] backdrop-blur-xl border-l border-brand/20 z-[200] flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-white/5">
        <h2 className="flex-1 text-sm text-brand font-mono font-semibold">
          Slide {String(slideIndex + 1).padStart(2, "0")} / {totalSlides}
        </h2>
        <button
          onClick={() => setRawMode(!rawMode)}
          className={`text-xs font-mono px-3 py-1 rounded border transition-colors ${
            rawMode
              ? "border-brand/50 text-brand"
              : "border-white/10 text-white/40 hover:text-white/60"
          }`}
        >
          {rawMode ? "Visual" : "HTML"}
        </button>
        <button
          onClick={onClose}
          className="border border-white/10 text-white/40 hover:border-red-400/50 hover:text-red-400 rounded px-3 py-1 text-xs transition-colors"
        >
          Close
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {rawMode ? (
          <>
            <textarea
              value={rawHtml}
              onChange={(e) => setRawHtml(e.target.value)}
              className="w-full h-[calc(100vh-200px)] bg-[#080818] border border-white/10 text-white/80 text-xs font-mono p-3 rounded-lg resize-none focus:outline-none focus:border-brand/50"
              spellCheck={false}
            />
            <button
              onClick={handleRawSave}
              className="w-full bg-brand text-[#080818] font-bold py-2.5 rounded-lg text-xs font-mono hover:brightness-110 transition-all"
            >
              Apply HTML
            </button>
          </>
        ) : (
          <>
            {/* Images */}
            <ImageManager slideHtml={slide.html} onUpdateHtml={onUpdate} />
            <hr className="border-white/5" />
            {/* Text fields */}
            {fields.map((field, idx) => (
              <div key={field.selector}>
                <label className="block text-[11px] text-brand/70 font-mono uppercase tracking-wider mb-1.5">
                  {field.label}
                </label>
                {fieldHint(field) && (
                  <p className="text-[10px] text-white/20 font-mono mb-1">
                    {fieldHint(field)}
                  </p>
                )}
                <textarea
                  value={values[idx] || ""}
                  onChange={(e) => handleFieldChange(idx, e.target.value)}
                  onBlur={handleFieldBlur}
                  rows={Math.max(2, (values[idx] || "").split("\n").length + 1)}
                  className="w-full bg-[#080818] border border-white/10 text-white/80 text-sm font-mono p-3 rounded-lg resize-y focus:outline-none focus:border-brand/50 transition-colors"
                />
              </div>
            ))}

            {fields.length > 0 && fontSizes.length > 0 && (
              <hr className="border-white/5" />
            )}

            {/* Font sizes */}
            {fontSizes.length > 0 && (
              <div>
                <div className="text-[11px] text-brand/70 font-mono uppercase tracking-wider mb-3">
                  Font Sizes
                </div>
                <div className="space-y-2">
                  {fontSizes.map((fs, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[11px] text-white/40 font-mono min-w-[100px]">
                        {fs.label}
                      </span>
                      <button
                        onClick={() => handleFontSizeChange(idx, -2)}
                        className="w-7 h-7 border border-white/10 bg-[#080818] text-brand rounded text-sm font-bold flex items-center justify-center hover:border-brand/30 transition-colors"
                      >
                        -
                      </button>
                      <span className="text-xs text-white/40 font-mono min-w-[48px] text-center">
                        {fs.current}px
                      </span>
                      <button
                        onClick={() => handleFontSizeChange(idx, 2)}
                        className="w-7 h-7 border border-white/10 bg-[#080818] text-brand rounded text-sm font-bold flex items-center justify-center hover:border-brand/30 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {fields.length === 0 && fontSizes.length === 0 && (
              <div className="text-white/20 text-xs font-mono text-center py-8">
                No editable fields detected.
                <br />
                Use HTML mode to edit directly.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
