import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StoryblokProvider from "@/components/storyblok/StoryblokProvider";
import BackgroundEffects from "@/components/layout/BackgroundEffects";
import CookieBanner from "@/components/cookie/CookieBanner";
import TrackingScripts from "@/components/cookie/TrackingScripts";
import { getProfileData } from "@/lib/get-profile-data";
import { Analytics } from "@vercel/analytics/next";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: {
    default: "The Talented Mr. Szamowski | Maciej Szamowski",
    template: "%s | The Talented Mr. Szamowski",
  },
  description:
    "Maciej Szamowski — Marketing & Growth Leader with 15+ years scaling brands, teams and revenue across SaaS, gaming and e-commerce. Fullstack developer building with Next.js, Python and automation.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://szamowski.dev"
  ),
  keywords: [
    "Maciej Szamowski",
    "marketing director",
    "growth leader",
    "fullstack developer",
    "digital consultant",
    "SaaS marketing",
    "Next.js developer",
    "Warsaw Poland",
  ],
  authors: [{ name: "Maciej Szamowski" }],
  creator: "Maciej Szamowski",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://szamowski.dev",
    siteName: "The Talented Mr. Szamowski",
    title: "The Talented Mr. Szamowski | Maciej Szamowski",
    description:
      "Marketing & Growth Leader with 15+ years scaling brands, teams and revenue. Fullstack developer & digital one-man army.",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Talented Mr. Szamowski | Maciej Szamowski",
    description:
      "Marketing & Growth Leader with 15+ years scaling brands, teams and revenue. Fullstack developer & digital one-man army.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const data = await getProfileData();

  return (
    <html lang="en">
      <body className={`${jetbrainsMono.variable} font-mono antialiased`}>
        <Script id="google-consent-default" strategy="beforeInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});`}
        </Script>
        <BackgroundEffects />
        <StoryblokProvider>
          <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1 pt-16">{children}</main>
          <Footer
            name={data.personal.name}
            tagline={data.pages.footer_tagline}
            description={data.pages.footer_description}
            social={data.social}
          />
          </div>
        </StoryblokProvider>
        <TrackingScripts />
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  );
}
