"use client";

import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";

// Calculate actual work hours on this project
// Started: ~2025-02-01, assume ~4h per working day on average
const PROJECT_START = new Date("2025-02-01");

function getWorkStats() {
  const now = new Date();
  const diffMs = now.getTime() - PROJECT_START.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Count working days (Mon-Fri)
  let workingDays = 0;
  const d = new Date(PROJECT_START);
  while (d <= now) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) workingDays++;
    d.setDate(d.getDate() + 1);
  }

  const hours = workingDays * 4; // ~4h per working day
  return { hours, workingDays, totalDays: diffDays };
}

interface MatrixLine {
  text: string;
  delay: number; // ms after sequence starts
}

function getMatrixSequence(): MatrixLine[] {
  const stats = getWorkStats();
  return [
    { text: "Hello, User...", delay: 0 },
    { text: "Wake Up...", delay: 3500 },
    { text: "You're probably wondering how many days I worked on this beautiful web page?", delay: 7000 },
    { text: `${stats.hours}h = ${stats.workingDays} working days`, delay: 12000 },
    { text: "knock, knock", delay: 16000 },
    { text: "fill the contact form...", delay: 20000 },
  ];
}

const TYPE_SPEED = 50; // ms per character

export default function NavbarLogo() {
  const [phase, setPhase] = useState<"logo" | "matrix" | "done">("logo");
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [typedChars, setTypedChars] = useState(0);
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const sequenceRef = useRef<MatrixLine[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasStartedRef = useRef(false);

  const startLine = useCallback((lineIndex: number) => {
    const line = sequenceRef.current[lineIndex];
    if (!line) return;

    setCurrentLineIndex(lineIndex);
    setTypedChars(0);

    let charCount = 0;
    typingRef.current = setInterval(() => {
      charCount++;
      setTypedChars(charCount);
      if (charCount >= line.text.length) {
        if (typingRef.current) clearInterval(typingRef.current);
        typingRef.current = null;
        // Add completed line to displayed lines
        setDisplayedLines((prev) => [...prev, line.text]);
        setCurrentLineIndex(-1);
      }
    }, TYPE_SPEED);
  }, []);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    sequenceRef.current = getMatrixSequence();

    // After 15 seconds, start the Matrix sequence
    const startTimer = setTimeout(() => {
      setPhase("matrix");

      sequenceRef.current.forEach((line, i) => {
        const timer = setTimeout(() => {
          startLine(i);
        }, line.delay);
        timersRef.current.push(timer);
      });

      // After the last line + some buffer, go back to logo
      const lastLine = sequenceRef.current[sequenceRef.current.length - 1];
      const lastLineTypeDuration = lastLine.text.length * TYPE_SPEED;
      const endTimer = setTimeout(() => {
        setPhase("done");
        // Fade back to logo after a moment
        const revertTimer = setTimeout(() => {
          setPhase("logo");
          setDisplayedLines([]);
          setCurrentLineIndex(-1);
          hasStartedRef.current = false;
        }, 3000);
        timersRef.current.push(revertTimer);
      }, lastLine.delay + lastLineTypeDuration + 2000);
      timersRef.current.push(endTimer);
    }, 15000);

    timersRef.current.push(startTimer);

    return () => {
      timersRef.current.forEach(clearTimeout);
      if (typingRef.current) clearInterval(typingRef.current);
    };
  }, [startLine]);

  const currentLine = currentLineIndex >= 0 ? sequenceRef.current[currentLineIndex] : null;

  return (
    <Link href="/" className="relative block h-8 min-w-[160px] hover:opacity-80 transition-opacity">
      {/* Normal logo */}
      <div
        className={`transition-all duration-700 ${
          phase === "logo" ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo_header.svg"
          alt="szamowski.dev"
          className="h-8 w-auto"
        />
      </div>

      {/* Matrix text */}
      {(phase === "matrix" || phase === "done") && (
        <div
          className={`absolute inset-0 flex items-center transition-opacity duration-700 ${
            phase === "done" ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="font-mono text-[10px] leading-tight text-brand/80 whitespace-nowrap overflow-hidden max-w-[280px]">
            {/* Show only the last completed line + current typing line */}
            {displayedLines.length > 0 && currentLineIndex === -1 && (
              <div className="text-brand/40 truncate">
                {displayedLines[displayedLines.length - 1]}
              </div>
            )}
            {currentLine && (
              <div>
                <span className="text-brand">
                  {currentLine.text.slice(0, typedChars)}
                </span>
                <span className="text-brand animate-pulse">▋</span>
              </div>
            )}
            {phase === "done" && displayedLines.length > 0 && (
              <div className="text-brand">
                {displayedLines[displayedLines.length - 1]}
              </div>
            )}
          </div>
        </div>
      )}
    </Link>
  );
}
