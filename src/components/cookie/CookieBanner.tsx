"use client";

import { useState, useEffect, useCallback } from "react";
import {
  hasConsented,
  getConsent,
  setConsent,
} from "@/lib/cookie-consent";

interface ToggleProps {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (val: boolean) => void;
}

function Toggle({ label, description, checked, disabled, onChange }: ToggleProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <span className="relative mt-1 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <span
          className={`block w-10 h-6 rounded-full transition-colors ${
            checked ? "bg-brand" : "bg-white/10"
          } ${disabled ? "opacity-50" : ""}`}
        />
        <span
          className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-4" : ""
          }`}
        />
      </span>
      <span>
        <span className="block text-sm font-semibold text-white">
          {label}
          {disabled && (
            <span className="ml-2 text-xs text-gray-500 font-normal">
              (always on)
            </span>
          )}
        </span>
        <span className="block text-xs text-gray-400 mt-0.5">
          {description}
        </span>
      </span>
    </label>
  );
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const open = useCallback(() => {
    const saved = getConsent();
    if (saved) {
      setAnalytics(saved.analytics);
      setMarketing(saved.marketing);
    }
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!hasConsented()) setVisible(true);

    const handler = () => open();
    window.addEventListener("open-cookie-settings", handler);
    return () => window.removeEventListener("open-cookie-settings", handler);
  }, [open]);

  if (!visible) return null;

  const handleAcceptAll = () => {
    setConsent({ analytics: true, marketing: true });
    setVisible(false);
  };

  const handleRejectAll = () => {
    setConsent({ analytics: false, marketing: false });
    setVisible(false);
  };

  const handleSave = () => {
    setConsent({ analytics, marketing });
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 animate-slide-up">
      <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-[#0a1f14] backdrop-blur-2xl border border-brand/15 shadow-[0_0_40px_rgba(0,0,0,0.6)] max-h-[85vh] overflow-y-auto">
        {!showDetails ? (
          <>
            <h3 className="text-base font-bold text-white mb-2">
              Cookie Preferences
            </h3>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              We use cookies to analyze site traffic and optimize your
              experience. You can choose which cookies to allow.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleAcceptAll}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold bg-brand text-black transition-all duration-300 hover:shadow-[0_0_25px_rgba(13,223,114,0.4)] hover:scale-105 cursor-pointer"
              >
                Accept All
              </button>
              <button
                onClick={handleRejectAll}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold border border-brand text-brand transition-all duration-300 hover:bg-brand/10 cursor-pointer"
              >
                Reject All
              </button>
              <button
                onClick={() => setShowDetails(true)}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                Customize
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-base font-bold text-white mb-4">
              Cookie Settings
            </h3>
            <div className="space-y-4 mb-5">
              <Toggle
                label="Necessary"
                description="Essential for the website to function. Cannot be disabled."
                checked={true}
                disabled
                onChange={() => {}}
              />
              <Toggle
                label="Analytics"
                description="Help us understand how visitors interact with the website (Google Analytics)."
                checked={analytics}
                onChange={setAnalytics}
              />
              <Toggle
                label="Marketing"
                description="Used to deliver relevant ads and track campaigns (Meta, TikTok, LinkedIn)."
                checked={marketing}
                onChange={setMarketing}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleSave}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold bg-brand text-black transition-all duration-300 hover:shadow-[0_0_25px_rgba(13,223,114,0.4)] hover:scale-105 cursor-pointer"
              >
                Save Preferences
              </button>
              <button
                onClick={handleAcceptAll}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold border border-brand text-brand transition-all duration-300 hover:bg-brand/10 cursor-pointer"
              >
                Accept All
              </button>
              <button
                onClick={() => setShowDetails(false)}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
