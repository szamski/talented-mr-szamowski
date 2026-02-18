"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface TerminalHeadingProps {
  /** Full plain text of the heading (e.g. "The Art of Adaptability") */
  text: string;
  /** The part to render with text-gradient class */
  highlight?: string;
  /** Typing speed in ms per character */
  speed?: number;
  /** Additional className for the h2 */
  className?: string;
}

function StyledText({ text, highlight }: { text: string; highlight?: string }) {
  if (highlight) {
    const idx = text.indexOf(highlight);
    const before = text.slice(0, idx);
    const after = text.slice(idx + highlight.length);
    return <>{before}<span className="text-gradient">{highlight}</span>{after}</>;
  }
  return <>{text}</>;
}

/**
 * An h2 heading that types out character-by-character like a terminal
 * prompt when it scrolls into view. Once done, shows the final styled
 * heading with gradient highlight.
 *
 * In "waiting" state (before scroll), renders the full styled heading
 * so it's always accessible and testable.
 */
export default function TerminalHeading({
  text,
  highlight,
  speed = 35,
  className = "",
}: TerminalHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [phase, setPhase] = useState<"waiting" | "typing" | "done">("waiting");
  const [charCount, setCharCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasStarted = useRef(false);

  const startTyping = useCallback(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    setPhase("typing");

    let count = 0;
    intervalRef.current = setInterval(() => {
      count++;
      setCharCount(count);
      if (count >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setTimeout(() => setPhase("done"), 100);
      }
    }, speed);
  }, [text, speed]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if ("ontouchstart" in window && navigator.maxTouchPoints > 0) {
      setPhase("done");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startTyping();
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [startTyping]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <h2 ref={ref} className={className}>
      {phase === "typing" ? (
        <>
          <span>{text.slice(0, charCount)}</span>
          <span className="text-brand animate-pulse">▋</span>
        </>
      ) : (
        <StyledText text={text} highlight={highlight} />
      )}
    </h2>
  );
}
