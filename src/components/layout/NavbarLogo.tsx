"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";

const PROJECT_START = new Date("2026-16-03");

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

const SEQUENCE = [
  "Hello, User...",
  "Wake Up...",
  "How many days did I work on this?",
  () => {
    const s = getWorkStats();
    return `${s.hours}h = ${s.workingDays} working days`;
  },
  "knock, knock",
  "fill the contact form...",
] as const;

const TYPE_SPEED = 45;
const PAUSE_BETWEEN_STEPS = 2000;
const PAUSE_AFTER_LAST = 3000;
const IDLE_PAUSE = 15000;

export default function NavbarLogo() {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const cancelRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    cancelRef.current = false;

    function cleanup() {
      cancelRef.current = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    function wait(ms: number): Promise<void> {
      return new Promise((resolve) => {
        timeoutRef.current = setTimeout(resolve, ms);
      });
    }

    function typeText(text: string): Promise<void> {
      return new Promise((resolve) => {
        let i = 0;
        intervalRef.current = setInterval(() => {
          if (cancelRef.current) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            resolve();
            return;
          }
          i++;
          setDisplayText(text.slice(0, i));
          if (i >= text.length) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = null;
            resolve();
          }
        }, TYPE_SPEED);
      });
    }

    async function runLoop() {
      // Wait before first sequence
      await wait(IDLE_PAUSE);

      while (!cancelRef.current) {
        setIsTyping(true);

        for (let i = 0; i < SEQUENCE.length; i++) {
          if (cancelRef.current) break;

          const step = SEQUENCE[i];
          const text = typeof step === "function" ? step() : step;

          setDisplayText("");
          await typeText(text);

          if (cancelRef.current) break;

          const pause =
            i === SEQUENCE.length - 1 ? PAUSE_AFTER_LAST : PAUSE_BETWEEN_STEPS;
          await wait(pause);
        }

        // Back to idle cursor
        setIsTyping(false);
        setDisplayText("");

        if (cancelRef.current) break;
        await wait(IDLE_PAUSE);
      }
    }

    runLoop();

    return cleanup;
  }, []);

  return (
    <Link
      href="/"
      className="relative flex items-center h-8 hover:opacity-80 transition-opacity"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logo_header_no_cursor.svg"
        alt="szamowski.dev"
        className="h-8 w-auto"
      />

      {/* Cursor / Matrix text — absolutely positioned so logo never shifts */}
      <div className="absolute left-full flex items-center h-8 ml-1">
        {!isTyping ? (
          <span className="inline-block w-2.5 h-4 bg-brand animate-pulse rounded-px" />
        ) : (
          <span className="font-mono text-sm leading-none text-brand whitespace-nowrap">
            {displayText}
            <span className="animate-pulse">▋</span>
          </span>
        )}
      </div>
    </Link>
  );
}
