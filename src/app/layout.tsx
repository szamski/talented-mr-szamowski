import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StoryblokProvider from "@/components/storyblok/StoryblokProvider";
import BackgroundEffects from "@/components/layout/BackgroundEffects";
import { getProfileData } from "@/lib/get-profile-data";

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
    process.env.NEXT_PUBLIC_SITE_URL || "https://szamowski.dev"
  ),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const data = await getProfileData();

  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <BackgroundEffects />
        <StoryblokProvider>
          <Navbar name={data.personal.name} tagline={data.personal.tagline} />
          <main className="min-h-screen pt-16">{children}</main>
          <Footer
            name={data.personal.name}
            tagline={data.pages.footer_tagline}
            description={data.pages.footer_description}
            social={data.social}
          />
        </StoryblokProvider>
      </body>
    </html>
  );
}
