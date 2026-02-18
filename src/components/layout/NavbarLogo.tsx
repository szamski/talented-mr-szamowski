"use client";

import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";

const PROJECT_START = new Date("2025-02-01");

function getWorkStats() {
  const now = new Date();
  let workingDays = 0;
  const d = new Date(PROJECT_START);
  while (d <= now) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) workingDays++;
    d.setDate(d.getDate() + 1);
  }
  const hours = workingDays * 4;
  return { hours, workingDays };
}

interface Step {
  text: string;
  pauseAfter: number; // ms to wait after this line finishes typing
}

function getSequence(): Step[] {
  const stats = getWorkStats();
  return [
    { text: "Hello, User...", pauseAfter: 2000 },
    { text: "Wake Up...", pauseAfter: 2000 },
    { text: "How many days did I work on this?", pauseAfter: 2000 },
    { text: `${stats.hours}h = ${stats.workingDays} working days`, pauseAfter: 2000 },
    { text: "knock, knock", pauseAfter: 2000 },
    { text: "fill the contact form...", pauseAfter: 3000 },
  ];
}

const TYPE_SPEED = 45;

export default function NavbarLogo() {
  const [matrixActive, setMatrixActive] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const runSequence = useCallback(() => {
    if (!mountedRef.current) return;
    const steps = getSequence();
    setMatrixActive(true);
    setShowCursor(true);

    let totalDelay = 0;

    steps.forEach((step, i) => {
      // Start typing this step after totalDelay
      const startDelay = totalDelay;
      const typeDuration = step.text.length * TYPE_SPEED;

      timersRef.current.push(
        setTimeout(() => {
          if (!mountedRef.current) return;
          setCurrentText("");
          setShowCursor(true);

          let charCount = 0;
          intervalRef.current = setInterval(() => {
            if (!mountedRef.current) return;
            charCount++;
            setCurrentText(step.text.slice(0, charCount));
            if (charCount >= step.text.length) {
              if (intervalRef.current) clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }, TYPE_SPEED);
        }, startDelay)
      );

      totalDelay += typeDuration + step.pauseAfter;

      // If not last step, clear text before next step
      if (i < steps.length - 1) {
        timersRef.current.push(
          setTimeout(() => {
            if (!mountedRef.current) return;
            setCurrentText("");
            setShowCursor(true);
          }, totalDelay - 200)
        );
      }
    });

    // After entire sequence, go back to cursor mode, then loop
    timersRef.current.push(
      setTimeout(() => {
        if (!mountedRef.current) return;
        setMatrixActive(false);
        setCurrentText("");
        // Wait 15s, then start again
        timersRef.current.push(
          setTimeout(() => {
            if (mountedRef.current) runSequence();
          }, 15000)
        );
      }, totalDelay)
    );
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    // First trigger after 15 seconds
    const initialTimer = setTimeout(() => {
      if (mountedRef.current) runSequence();
    }, 15000);
    timersRef.current.push(initialTimer);

    return () => {
      mountedRef.current = false;
      timersRef.current.forEach(clearTimeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [runSequence]);

  return (
    <Link href="/" className="flex items-center gap-0 h-8 hover:opacity-80 transition-opacity">
      {/* Logo SVG without the blinking cursor — we handle that ourselves */}
      <svg width="270" height="60" viewBox="0 0 270 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto">
        <path d="M10 30C10 18.9543 18.9543 10 30 10H160L175 30L160 50H30C18.9543 50 10 41.0457 10 30Z" fill="#1A1A1A" stroke="#0DDF72" strokeWidth="1.5"/>
        <g transform="translate(25, 20) scale(0.9)">
          <path d="M15.769,0c0.053,0,0.106,0,0.162,0c0.13,1.606-0.483,2.806-1.228,3.675c-0.731,0.863-1.732,1.7-3.351,1.573c-0.108-1.583,0.506-2.694,1.25-3.561C13.292,0.879,14.557,0.16,15.769,0z" fill="#0DDF72"/>
          <path d="M20.67,16.716c0,0.016,0,0.03,0,0.045c-0.455,1.378-1.104,2.559-1.896,3.655c-0.723,0.995-1.609,2.334-3.191,2.334c-1.367,0-2.275-0.879-3.676-0.903c-1.482-0.024-2.297,0.735-3.652,0.926c-0.155,0-0.31,0-0.462,0c-0.995-0.144-1.798-0.932-2.383-1.642c-1.725-2.098-3.058-4.808-3.306-8.276c0-0.34,0-0.679,0-1.019c0.105-2.482,1.311-4.5,2.914-5.478c0.846-0.52,2.009-0.963,3.304-0.765c0.555,0.086,1.122,0.276,1.619,0.464c0.471,0.181,1.06,0.502,1.618,0.485c0.378-0.011,0.754-0.208,1.135-0.347c1.116-0.403,2.21-0.865,3.652-0.648c1.733,0.262,2.963,1.032,3.723,2.22c-1.466,0.933-2.625,2.339-2.427,4.74C17.818,14.688,19.086,15.964,20.67,16.716z" fill="#0DDF72"/>
        </g>
        <text x="55" y="36" fill="#0DDF72" style={{font: "500 18px 'JetBrains Mono', monospace"}}>szamowski</text>
        <path d="M160 10L175 30L160 50H220L235 30L220 10H160Z" fill="#0DDF72" strokeWidth="1.5" stroke="#0DDF72"/>
        <text x="178" y="36" fill="#1A1A1A" style={{font: "700 18px 'JetBrains Mono', monospace"}}>.dev</text>
        <text x="245" y="36" fill="#0DDF72" style={{font: "500 20px 'JetBrains Mono', monospace"}}>→</text>
      </svg>

      {/* Blinking cursor OR matrix text — right after the arrow */}
      <div className="flex items-center h-8 ml-1 overflow-hidden">
        {!matrixActive ? (
          /* Normal blinking cursor */
          <span className="inline-block w-3 h-6 bg-brand animate-pulse" />
        ) : (
          /* Matrix text typed out */
          <span className="font-mono text-xs text-brand whitespace-nowrap max-w-65 truncate">
            {currentText}
            {showCursor && <span className="animate-pulse">▋</span>}
          </span>
        )}
      </div>
    </Link>
  );
}
