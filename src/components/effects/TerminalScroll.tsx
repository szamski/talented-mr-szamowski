"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface TerminalLine {
  prompt: string;
  text: string;
  triggerPercent: number; // 0-100, when this line starts appearing relative to page scroll
}

const LINES: TerminalLine[] = [
  { prompt: "$ ", text: "whoami", triggerPercent: 5 },
  { prompt: "> ", text: "marketing_leader && full_stack_dev && music_producer", triggerPercent: 12 },
  { prompt: "$ ", text: "cat ./skills.txt", triggerPercent: 22 },
  { prompt: "> ", text: "brand_strategy growth_hacking automation data_analytics", triggerPercent: 28 },
  { prompt: "$ ", text: "ls -la ./experience/", triggerPercent: 38 },
  { prompt: "> ", text: "tiktok/ ubisoft/ samsung/ foap/ selmo/", triggerPercent: 44 },
  { prompt: "$ ", text: "echo $MOTTO", triggerPercent: 55 },
  { prompt: "> ", text: '"Conceptual Vision. Surgical Execution."', triggerPercent: 60 },
  { prompt: "$ ", text: "curl -X POST /api/contact --data 'lets_talk=true'", triggerPercent: 75 },
  { prompt: "> ", text: "{ status: 200, message: \"Looking forward to it.\" }", triggerPercent: 82 },
];

const TYPE_SPEED = 30; // ms per character

export default function TerminalScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [typedChars, setTypedChars] = useState<Record<number, number>>({});
  const typingTimers = useRef<Map<number, ReturnType<typeof setInterval>>>(new Map());
  const activatedLines = useRef<Set<number>>(new Set());

  const getScrollPercent = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    return docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  }, []);

  const startTyping = useCallback((lineIndex: number) => {
    if (typingTimers.current.has(lineIndex)) return;

    const line = LINES[lineIndex];
    const totalChars = line.prompt.length + line.text.length;
    let current = 0;

    const timer = setInterval(() => {
      current++;
      setTypedChars((prev) => ({ ...prev, [lineIndex]: current }));
      if (current >= totalChars) {
        clearInterval(timer);
        typingTimers.current.delete(lineIndex);
      }
    }, TYPE_SPEED);

    typingTimers.current.set(lineIndex, timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const percent = getScrollPercent();

      LINES.forEach((line, i) => {
        if (percent >= line.triggerPercent && !activatedLines.current.has(i)) {
          activatedLines.current.add(i);
          setVisibleLines((prev) => [...prev, i]);
          startTyping(i);
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // check initial position

    return () => {
      window.removeEventListener("scroll", handleScroll);
      typingTimers.current.forEach((timer) => clearInterval(timer));
    };
  }, [getScrollPercent, startTyping]);

  // Skip on touch / mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if ("ontouchstart" in window && navigator.maxTouchPoints > 0) {
      setIsMobile(true);
    }
  }, []);

  if (isMobile) return null;

  return (
    <div
      ref={containerRef}
      className="fixed right-6 top-20 z-40 pointer-events-none max-w-xs"
      aria-hidden="true"
    >
      <div className="space-y-0.5 font-mono text-[11px] leading-relaxed">
        {LINES.map((line, i) => {
          if (!visibleLines.includes(i)) return null;

          const chars = typedChars[i] || 0;
          const fullText = line.prompt + line.text;
          const displayed = fullText.slice(0, chars);
          const isTyping = chars < fullText.length;

          const isPrompt = chars <= line.prompt.length;

          return (
            <div key={i} className="flex animate-fade-in">
              <span className={isPrompt ? "text-brand/60" : "text-brand/60"}>
                {displayed.slice(0, line.prompt.length)}
              </span>
              <span className="text-brand/30">
                {displayed.slice(line.prompt.length)}
              </span>
              {isTyping && (
                <span className="text-brand/50 animate-pulse">▋</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
