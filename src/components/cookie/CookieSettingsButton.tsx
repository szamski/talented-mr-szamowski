"use client";

export default function CookieSettingsButton() {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event("open-cookie-settings"))}
      className="text-xs text-gray-500 hover:text-brand transition-colors cursor-pointer"
    >
      Cookie Settings
    </button>
  );
}
