import Image from "next/image";
import Button from "@/components/ui/Button";

interface HeroSectionProps {
  name: string;
  headline: string;
  tagline: string;
  headshot: { url: string; alt: string };
}

export default function HeroSection({ name, headline, tagline, headshot }: HeroSectionProps) {
  return (
    <section className="relative flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand/10 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-dark-green/30 rounded-full blur-[128px]" />

      <div className="relative z-10 max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text */}
        <div className="text-center lg:text-left">
          <p className="text-sm uppercase tracking-[0.3em] text-brand/70 mb-6 animate-fade-in">
            The Talented
          </p>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold mb-4 animate-fade-in">
            <span className="text-gradient">{name}</span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-400 mb-3 animate-slide-up">
            {tagline}
          </p>
          <p className="text-base sm:text-lg text-gray-500 mb-10 animate-slide-up">
            {headline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up">
            <Button href="/contact">Get in Touch</Button>
            <Button href="#experience" variant="outline">
              See My Work
            </Button>
          </div>
        </div>

        {/* Photo — transparent PNG, floats over background */}
        <div className="relative hidden lg:flex justify-center items-end animate-fade-in">
          <div className="relative w-105 h-140 xl:w-120 xl:h-160">
            {/* Glow behind figure */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-80 h-80 bg-brand/15 rounded-full blur-[100px]" />
            {/* Green accent rings behind */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-72 h-72 xl:w-80 xl:h-80 rounded-full border border-brand/15" />
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-88 h-88 xl:w-96 xl:h-96 rounded-full border border-brand/8" />
            {/* Photo — unoptimized to preserve PNG transparency */}
            <div className="relative w-full h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={headshot.url}
                alt={headshot.alt}
                className="absolute inset-0 w-full h-full object-contain object-bottom drop-shadow-[0_0_40px_rgba(13,223,114,0.12)]"
                fetchPriority="high"
              />
              {/* Bottom fade into background */}
              <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#050a08] via-[#050a08]/60 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
