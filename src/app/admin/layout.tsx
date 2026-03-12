import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Content Editor",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Hide public site chrome, show admin's own UI */}
      <style>{`
        nav:not(.admin-nav), footer, .grain-overlay, .dot-matrix,
        .orb-1, .orb-2, .orb-3,
        [class*="background-effects"],
        [class*="animate-slide-up"],
        [class*="cookie"] { display: none !important; }
        main { padding-top: 0 !important; }
      `}</style>
      {children}
    </>
  );
}
