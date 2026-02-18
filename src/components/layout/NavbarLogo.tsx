"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";

const PROJECT_START = new Date("2026-02-17");

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

type SequenceItem = string | (() => string) | { text: string; link: string };

const SEQUENCE: SequenceItem[] = [
  "Months of work?",
  "I deliver in days.",
  () => {
    const s = getWorkStats();
    return `${s.hours}h logged so far.`;
  },
  "Strategy to code.",
  "One person. Full stack.",
  "Ready to start?",
  { text: "Let's talk ", link: "/contact" },
];

const TYPE_SPEED = 30;
const PAUSE_BETWEEN_STEPS = 2000;
const PAUSE_AFTER_LAST = 3000;
const IDLE_PAUSE = 15000;

function getStepText(step: SequenceItem): string {
  if (typeof step === "function") return step();
  if (typeof step === "object") return step.text + "here.";
  return step;
}

export default function NavbarLogo() {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState<SequenceItem | null>(null);
  const [stepDone, setStepDone] = useState(false);
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
      await wait(IDLE_PAUSE);

      while (!cancelRef.current) {
        setIsTyping(true);

        for (let i = 0; i < SEQUENCE.length; i++) {
          if (cancelRef.current) break;

          const step = SEQUENCE[i];
          const text = getStepText(step);

          setCurrentStep(step);
          setStepDone(false);
          setDisplayText("");
          await typeText(text);
          setStepDone(true);

          if (cancelRef.current) break;

          const pause =
            i === SEQUENCE.length - 1 ? PAUSE_AFTER_LAST : PAUSE_BETWEEN_STEPS;
          await wait(pause);
        }

        setIsTyping(false);
        setCurrentStep(null);
        setStepDone(false);
        setDisplayText("");

        if (cancelRef.current) break;
        await wait(IDLE_PAUSE);
      }
    }

    runLoop();

    return cleanup;
  }, []);

  const isLinkStep = typeof currentStep === "object" && currentStep !== null;

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

      {/* Cursor / typed text — absolutely positioned so logo never shifts */}
      <div
        className="absolute left-full flex items-center h-8 ml-1 max-w-[calc(100vw-180px)] overflow-hidden"
        style={{ maskImage: "linear-gradient(to right, black 70%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, black 70%, transparent 100%)" }}
      >
        {!isTyping ? (
          <span className="inline-block w-2.5 h-4 bg-brand animate-pulse rounded-px" />
        ) : isLinkStep && stepDone ? (
          <span className="font-mono text-sm leading-none text-brand whitespace-nowrap">
            {currentStep.text}
            <Link
              href={currentStep.link}
              className="underline crt-flicker"
              onClick={(e) => e.stopPropagation()}
            >
              here
            </Link>
            .
            <span className="animate-pulse">▋</span>
          </span>
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
