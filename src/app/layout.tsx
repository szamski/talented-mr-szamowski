import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StoryblokProvider from "@/components/storyblok/StoryblokProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "The Talented Mr. Szamowski",
    template: "%s | The Talented Mr. Szamowski",
  },
  description:
    "Marketing and business leader with 15+ years of experience. Digital One Man Army.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://szamowski.com"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <StoryblokProvider>
          <Navbar />
          <main className="min-h-screen pt-16">{children}</main>
          <Footer />
        </StoryblokProvider>
      </body>
    </html>
  );
}
