"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import AdminNavbar from "@/components/admin/AdminNavbar";

/* ─── Social link labels for text-based rendering (bulletproof in all email clients) ─── */

const SOCIAL_LABELS: Record<string, string> = {
  linkedin: "in",
  github: "gh",
  whatsapp: "wa",
  twitter: "x",
  instagram: "ig",
  facebook: "fb",
};

const AVAILABLE_PLATFORMS = ["LinkedIn", "GitHub", "WhatsApp", "Twitter", "Instagram", "Facebook"];

const DEFAULT_SOCIAL = [
  { platform: "LinkedIn", url: "https://linkedin.com/in/szamowski" },
  { platform: "GitHub", url: "https://github.com/szamski" },
  { platform: "WhatsApp", url: "https://api.whatsapp.com/send?phone=48793324715" },
];

interface SocialLink {
  platform: string;
  url: string;
}

export default function EmailSignaturePage() {
  const [fullName, setFullName] = useState("Maciej Szamowski");
  const [jobTitle, setJobTitle] = useState("Founder & Consultant");
  const [tagline, setTagline] = useState("Digital One Man Army");
  const [email, setEmail] = useState("maciek.szamowski@gmail.com");
  const [phone, setPhone] = useState("+48 793 324 715");
  const [website, setWebsite] = useState("szamowski.dev");
  const [avatarUrl, setAvatarUrl] = useState("https://i.imgur.com/vpRZYTt.png");
  const [socials, setSocials] = useState<SocialLink[]>(DEFAULT_SOCIAL);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [showTagline, setShowTagline] = useState(true);
  const [avatarSize, setAvatarSize] = useState(96);
  const [accentColor, setAccentColor] = useState("#0ddf72");
  const [darkGreen] = useState("#1d392b");
  const [copied, setCopied] = useState(false);
  const [copiedSource, setCopiedSource] = useState(false);

  // Social editing
  const [newPlatform, setNewPlatform] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const previewRef = useRef<HTMLDivElement>(null);

  function addSocial() {
    const p = newPlatform.trim();
    const u = newUrl.trim();
    if (p && u) {
      setSocials([...socials, { platform: p, url: u }]);
      setNewPlatform("");
      setNewUrl("");
    }
  }

  function removeSocial(idx: number) {
    setSocials(socials.filter((_, i) => i !== idx));
  }

  const generateSignatureHTML = useCallback(() => {
    const fontStack = "'JetBrains Mono', monospace";

    const socialLinksHtml = socials
      .map((s) => {
        const label = SOCIAL_LABELS[s.platform.toLowerCase()] || s.platform.slice(0, 2).toLowerCase();
        return `<td style="padding: 0 5px 0 0;">
          <a href="${s.url}" target="_blank" style="display: inline-block; text-decoration: none; background-color: ${darkGreen}; color: #ffffff; font-family: ${fontStack}; font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 4px; letter-spacing: 0.5px; line-height: 1;">${label}</a>
        </td>`;
      })
      .join("\n");

    const disclaimerHtml = showDisclaimer
      ? `<tr>
          <td colspan="2" style="padding: 16px 0 0 0;">
            <p style="color: #999999; font-size: 9px; font-family: ${fontStack}; line-height: 1.5; margin: 0; max-width: 500px;">
              The contents of this email and any attachments are confidential. It is strictly forbidden to share any part of this message with any third party, without a written consent of the sender. If you received this message by mistake, please reply to this message and follow with its deletion.
            </p>
          </td>
        </tr>`
      : "";

    const taglineHtml = showTagline && tagline
      ? `
                    <tr>
                      <td style="padding: 2px 0 8px 0;">
                        <p style="margin: 0; font-size: 10px; font-family: ${fontStack}; color: #999999; line-height: 1.4;">
                          <span style="color: ${accentColor};">//</span> ${tagline}
                        </p>
                      </td>
                    </tr>`
      : "";

    return `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin: 0; border-spacing: 0; border-collapse: collapse; font-family: ${fontStack};">
  <tbody>
    <tr>
      <td valign="top" style="padding: 0 0 0 0; width: 3px; background-color: ${accentColor};">
        <div style="width: 3px; font-size: 1px; line-height: 1px; color: ${accentColor};">&zwnj;</div>
      </td>
      <td style="padding: 0 0 0 16px;">
        <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin: 0; border-spacing: 0; border-collapse: collapse;">
          <tbody>
            <tr>
              <td valign="top" style="padding: 0 18px 0 0;">
                <img width="${avatarSize}" height="${avatarSize}" src="${avatarUrl}" alt="${fullName}" style="width: ${avatarSize}px; height: ${avatarSize}px; border-radius: 50%; display: block; border: 3px solid ${accentColor};" />
              </td>
              <td valign="top" style="padding: 0;">
                <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin: 0; border-spacing: 0; border-collapse: collapse;">
                  <tbody>
                    <tr>
                      <td style="padding: 0;">
                        <p style="margin: 0; font-size: 18px; font-family: ${fontStack}; font-weight: 700; color: ${accentColor}; line-height: 1.2; letter-spacing: -0.5px;">
                          ${fullName}
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 2px 0 2px 0;">
                        <p style="margin: 0; font-size: 11px; font-family: ${fontStack}; color: ${darkGreen}; text-transform: uppercase; letter-spacing: 2.5px; line-height: 1.4; font-weight: 700;">
                          ${jobTitle}
                        </p>
                      </td>
                    </tr>${taglineHtml}
                    <tr>
                      <td style="padding: 6px 0 0 0;">
                        <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin: 0; border-spacing: 0; border-collapse: collapse;">
                          <tbody>${email ? `
                            <tr>
                              <td style="padding: 0 0 1px 0;">
                                <p style="margin: 0; font-size: 12px; font-family: ${fontStack}; line-height: 1.6;">
                                  <span style="color: ${accentColor}; font-weight: 700;">&gt;</span>&nbsp;<a href="mailto:${email}" style="text-decoration: none; color: #555555;">${email}</a>
                                </p>
                              </td>
                            </tr>` : ""}${phone ? `
                            <tr>
                              <td style="padding: 0 0 1px 0;">
                                <p style="margin: 0; font-size: 12px; font-family: ${fontStack}; line-height: 1.6;">
                                  <span style="color: ${accentColor}; font-weight: 700;">&gt;</span>&nbsp;<a href="tel:${phone.replace(/\s/g, "")}" style="text-decoration: none; color: #555555;">${phone}</a>
                                </p>
                              </td>
                            </tr>` : ""}${website ? `
                            <tr>
                              <td style="padding: 0 0 1px 0;">
                                <p style="margin: 0; font-size: 12px; font-family: ${fontStack}; line-height: 1.6;">
                                  <span style="color: ${accentColor}; font-weight: 700;">&gt;</span>&nbsp;<a href="https://${website}" style="text-decoration: none; color: ${accentColor}; font-weight: 700;">${website}</a>
                                </p>
                              </td>
                            </tr>` : ""}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0 0 0;">
                        <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin: 0; border-spacing: 0; border-collapse: collapse;">
                          <tbody>
                            <tr>
                              ${socialLinksHtml}
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
    ${disclaimerHtml}
  </tbody>
</table>`;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullName, jobTitle, tagline, email, phone, website, avatarUrl, avatarSize, accentColor, darkGreen, socials, showDisclaimer, showTagline]);

  const [signatureHtml, setSignatureHtml] = useState("");

  useEffect(() => {
    setSignatureHtml(generateSignatureHTML());
  }, [generateSignatureHTML]);

  async function handleCopy() {
    try {
      const blob = new Blob([signatureHtml], { type: "text/html" });
      const textBlob = new Blob([signatureHtml], { type: "text/plain" });
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": blob,
          "text/plain": textBlob,
        }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      await navigator.clipboard.writeText(signatureHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleCopySource() {
    navigator.clipboard.writeText(signatureHtml);
    setCopiedSource(true);
    setTimeout(() => setCopiedSource(false), 2000);
  }

  function handleAvatarFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => setAvatarUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="min-h-screen bg-[#050a08]">
      <AdminNavbar />

      <div className="max-w-6xl mx-auto px-6 pt-24 pb-12">
        <h2 className="text-sm font-mono text-brand/70 uppercase tracking-wider mb-6">
          Email Signature Generator
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Controls */}
          <div className="space-y-5">
            {/* Identity */}
            <div className="glass rounded-xl border border-white/5 p-5 space-y-3">
              <div className="text-[11px] text-brand/70 font-mono uppercase tracking-wider mb-3">
                Identity
              </div>
              <div>
                <label className="block text-[11px] text-white/40 font-mono mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#0a1510] border border-white/10 rounded-lg px-3 py-2 text-brand text-sm font-mono font-bold focus:outline-none focus:border-brand/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] text-white/40 font-mono mb-1">Job Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full bg-[#0a1510] border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-brand/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] text-brand/40 font-mono mb-1">
                  Tagline <span className="text-white/20">// code comment style</span>
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-[#0a1510] border border-white/10 rounded-lg px-3 py-2 text-white/60 text-sm font-mono focus:outline-none focus:border-brand/50 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-white/40 font-mono mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0a1510] border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-brand/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-white/40 font-mono mb-1">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#0a1510] border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-brand/50 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-white/40 font-mono mb-1">Website (without https://)</label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full bg-[#0a1510] border border-white/10 rounded-lg px-3 py-2 text-brand text-sm font-mono focus:outline-none focus:border-brand/50 transition-colors"
                />
              </div>
            </div>

            {/* Avatar */}
            <div className="glass rounded-xl border border-white/5 p-5 space-y-3">
              <div className="text-[11px] text-brand/70 font-mono uppercase tracking-wider mb-3">
                Avatar
              </div>
              <div>
                <label className="block text-[11px] text-white/40 font-mono mb-1">Avatar URL</label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full bg-[#0a1510] border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-brand/50 transition-colors"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const i = document.createElement("input");
                    i.type = "file";
                    i.accept = "image/*";
                    i.onchange = (e) => {
                      const f = (e.target as HTMLInputElement).files?.[0];
                      if (f) handleAvatarFile(f);
                    };
                    i.click();
                  }}
                  className="text-xs font-mono text-brand/60 border border-brand/20 rounded-lg px-3 py-1.5 hover:border-brand/40 transition-colors"
                >
                  Upload file
                </button>
                <span className="text-[10px] text-white/20 font-mono">or paste a URL above</span>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[11px] text-white/40 font-mono">Avatar Size</span>
                  <span className="text-[11px] text-brand font-mono">{avatarSize}px</span>
                </div>
                <input
                  type="range"
                  min={60}
                  max={130}
                  step={2}
                  value={avatarSize}
                  onChange={(e) => setAvatarSize(parseInt(e.target.value))}
                  className="w-full h-1 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: "#0ddf72", background: "rgba(13,223,114,0.08)" }}
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="glass rounded-xl border border-white/5 p-5 space-y-3">
              <div className="text-[11px] text-brand/70 font-mono uppercase tracking-wider mb-2">
                Social Links
              </div>
              <div className="space-y-2">
                {socials.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 group">
                    <span className="text-[10px] text-brand/60 font-mono font-bold w-20 truncate uppercase">{s.platform}</span>
                    <span className="text-[10px] text-white/25 font-mono flex-1 truncate">{s.url}</span>
                    <button
                      onClick={() => removeSocial(i)}
                      className="text-white/10 group-hover:text-red-400/70 text-sm transition-colors"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-[100px_1fr_auto] gap-2 pt-1">
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                  className="bg-[#0a1510] border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-brand/50 transition-colors"
                >
                  <option value="">Platform</option>
                  {AVAILABLE_PLATFORMS.filter(
                    (p) => !socials.find((s) => s.platform.toLowerCase() === p.toLowerCase())
                  ).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSocial()}
                  placeholder="https://..."
                  className="bg-[#0a1510] border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-brand/50 transition-colors"
                />
                <button
                  onClick={addSocial}
                  className="text-brand/60 border border-brand/20 rounded-lg px-3 py-1.5 text-xs font-mono hover:border-brand/40 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="glass rounded-xl border border-white/5 p-5 space-y-3">
              <div className="text-[11px] text-brand/70 font-mono uppercase tracking-wider mb-2">
                Options
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTagline}
                  onChange={(e) => setShowTagline(e.target.checked)}
                  className="accent-brand"
                />
                <span className="text-xs text-white/40 font-mono">Show tagline</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDisclaimer}
                  onChange={(e) => setShowDisclaimer(e.target.checked)}
                  className="accent-brand"
                />
                <span className="text-xs text-white/40 font-mono">Confidentiality disclaimer</span>
              </label>
              <div>
                <label className="block text-[11px] text-white/40 font-mono mb-1">Accent Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="bg-[#0a1510] border border-white/10 rounded-lg px-3 py-1.5 text-brand text-xs font-mono w-24 focus:outline-none focus:border-brand/50 transition-colors"
                  />
                  <button
                    onClick={() => setAccentColor("#0ddf72")}
                    className="text-[10px] text-white/20 font-mono hover:text-white/40 transition-colors"
                  >
                    Reset to brand
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Preview & Export */}
          <div className="space-y-5">
            {/* Live Preview */}
            <div className="glass rounded-xl border border-white/5 p-5">
              <div className="text-[11px] text-brand/70 font-mono uppercase tracking-wider mb-4">
                Live Preview
              </div>
              <div
                className="bg-white rounded-lg p-6 overflow-x-auto"
                ref={previewRef}
                dangerouslySetInnerHTML={{ __html: signatureHtml }}
              />
            </div>

            {/* Dark BG Preview */}
            <div className="glass rounded-xl border border-white/5 p-5">
              <div className="text-[11px] text-white/30 font-mono uppercase tracking-wider mb-4">
                Dark Mode Preview
              </div>
              <div
                className="rounded-lg p-6 overflow-x-auto"
                style={{ backgroundColor: "#050a08" }}
                dangerouslySetInnerHTML={{
                  __html: signatureHtml
                    .replace(/color: #555555/g, "color: #b0b0b0")
                    .replace(/color: #888888/g, "color: #999999")
                    .replace(/color: #999999;/g, "color: #666666;")
                }}
              />
            </div>

            {/* Actions */}
            <div className="glass rounded-xl border border-white/5 p-5 space-y-3">
              <div className="text-[11px] text-brand/70 font-mono uppercase tracking-wider mb-2">
                Export
              </div>
              <button
                onClick={handleCopy}
                className="w-full bg-brand text-[#050a08] font-bold py-3 rounded-lg text-sm font-mono hover:brightness-110 transition-all"
              >
                {copied ? "Copied!" : "Copy Signature (Rich HTML)"}
              </button>
              <button
                onClick={handleCopySource}
                className="w-full px-5 py-3 rounded-lg text-sm font-mono text-white/40 border border-white/10 hover:text-white/60 hover:border-white/20 transition-colors"
              >
                {copiedSource ? "Copied!" : "Copy HTML Source"}
              </button>
              <div className="border-t border-white/5 pt-3">
                <div className="text-[10px] text-white/20 font-mono space-y-1">
                  <p>Gmail: Settings &rarr; See all settings &rarr; Signature</p>
                  <p>Outlook: File &rarr; Options &rarr; Mail &rarr; Signatures</p>
                  <p>Apple Mail: Mail &rarr; Settings &rarr; Signatures</p>
                </div>
              </div>
            </div>

            {/* HTML Source (collapsible) */}
            <details className="glass rounded-xl border border-white/5">
              <summary className="p-5 text-[11px] text-white/30 font-mono uppercase tracking-wider cursor-pointer hover:text-white/50 transition-colors">
                HTML Source Code
              </summary>
              <div className="px-5 pb-5">
                <pre className="bg-[#0a1510] rounded-lg p-4 text-[10px] text-white/40 font-mono overflow-x-auto max-h-[300px] overflow-y-auto whitespace-pre-wrap break-all">
                  {signatureHtml}
                </pre>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
