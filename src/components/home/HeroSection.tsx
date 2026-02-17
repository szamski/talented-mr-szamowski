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

      <div className="relative z-10 max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
        {/* Text — aligned to bottom of photo */}
        <div className="text-center lg:text-left pb-8">
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

        {/* Photo — transparent PNG, 20% bigger, CSS mask fade to transparent */}
        <div className="relative hidden lg:flex justify-center animate-fade-in">
          <div className="relative w-125 h-165 xl:w-145 xl:h-190">
            {/* Glow behind figure */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand/12 rounded-full blur-[120px]" />
            {/* Green accent rings behind */}
            <div className="absolute bottom-28 left-1/2 -translate-x-1/2 w-80 h-80 xl:w-88 xl:h-88 rounded-full border border-brand/15" />
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-96 h-96 xl:w-104 xl:h-104 rounded-full border border-brand/8" />
            {/* Photo — native img to preserve PNG transparency */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={headshot.url}
              alt={headshot.alt}
              className="absolute inset-0 w-full h-full object-contain object-bottom drop-shadow-[0_0_40px_rgba(13,223,114,0.12)]"
              style={{
                maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
              }}
              fetchPriority="high"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
