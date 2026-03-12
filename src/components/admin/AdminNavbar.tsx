"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

interface AdminNavbarProps {
  projectName?: string;
  status?: string;
  dirty?: boolean;
  saving?: boolean;
  onSave?: () => void;
  onAddSlide?: () => void;
  onExport?: () => void;
}

export default function AdminNavbar({
  projectName,
  status,
  dirty,
  saving,
  onSave,
  onAddSlide,
  onExport,
}: AdminNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isEditor = pathname.startsWith("/admin/editor");

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-0 border-b border-brand/10 bg-[rgba(5,10,8,0.85)] backdrop-blur-xl">
      <nav className="admin-nav max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        {/* Logo / Home */}
        <Link
          href="/admin"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo_header_no_cursor.svg"
            alt="szamowski.dev"
            className="h-7 w-auto"
          />
          <span className="text-xs font-mono text-brand/50 hidden sm:inline">
            / admin
          </span>
        </Link>

        {/* Project name breadcrumb */}
        {isEditor && projectName && (
          <div className="flex items-center gap-2 ml-2">
            <span className="text-white/20 text-xs">/</span>
            <span className="text-sm font-mono text-white/70 truncate max-w-[200px]">
              {projectName}
            </span>
          </div>
        )}

        {/* Status */}
        {status && (
          <span className="text-xs text-white/30 font-mono hidden sm:inline ml-auto mr-2">
            {status}
          </span>
        )}

        {/* Spacer when no status */}
        {!status && <div className="flex-1" />}

        {/* Editor actions */}
        {isEditor && (
          <div className="flex items-center gap-2">
            {onAddSlide && (
              <button
                onClick={onAddSlide}
                className="text-white/50 hover:text-brand border border-white/10 hover:border-brand/30 font-mono text-xs px-3 py-1.5 rounded-lg transition-colors"
              >
                + Slide
              </button>
            )}
            {onExport && (
              <button
                onClick={onExport}
                className="text-white/50 hover:text-white border border-white/10 hover:border-white/30 font-mono text-xs px-3 py-1.5 rounded-lg transition-colors"
              >
                Export
              </button>
            )}
            {onSave && (
              <button
                onClick={onSave}
                disabled={saving || !dirty}
                className="bg-brand text-[#050a08] font-bold px-4 py-1.5 rounded-lg text-xs font-mono hover:brightness-110 transition-all disabled:opacity-30 disabled:cursor-default"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            )}
          </div>
        )}

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-4">
          {[
            { href: "/admin", label: "Projects" },
            { href: "/admin/avatar", label: "Avatar" },
            { href: "/admin/cover-photo", label: "Cover Photo" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "text-brand"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="text-xs font-mono text-white/40 hover:text-red-400 transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
}
