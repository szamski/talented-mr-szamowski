import Button from "@/components/ui/Button";
import ParticleField from "@/components/home/ParticleField";

interface HeroSectionProps {
  name: string;
  headline: string;
  tagline: string;
  headshot: { url: string; alt: string };
}

export default function HeroSection({ name, headline, tagline, headshot }: HeroSectionProps) {
  return (
    <section className="relative flex items-center justify-center pb-16 sm:pb-0 sm:min-h-[min(calc(100svh-4rem),48rem)] pt-8 px-4 overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand/10 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-dark-green/30 rounded-full blur-[128px]" />

      <div className="relative z-10 max-w-6xl 2xl:max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
        {/* Text — aligned to bottom of photo */}
        <div className="text-center lg:text-left pb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-brand/70 mb-6 animate-fade-in">
            The Talented
          </p>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl 2xl:text-9xl font-bold mb-4 animate-fade-in">
            <span className="text-gradient">{name}</span>
          </h1>
          <p className="text-base sm:text-2xl text-gray-400 mb-3 animate-slide-up">
            {tagline}
          </p>
          <p className="text-xs sm:text-lg text-gray-500 mb-6 sm:mb-10 animate-slide-up">
            {headline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up">
            <Button href="/contact">Get in Touch</Button>
            <Button href="#experience" variant="outline">
              See My Work
            </Button>
          </div>
        </div>

        {/* Photo — transparent PNG, CSS mask fade to transparent */}
        <div className="relative hidden lg:flex justify-center animate-fade-in">
          <div className="relative w-106 h-140 xl:w-124 xl:h-162">
            {/* Particle field behind figure — z-0 */}
            <ParticleField />
            {/* Photo — z-10, native img to preserve PNG transparency */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={headshot.url}
              alt={headshot.alt}
              className="absolute z-10 inset-0 w-full h-full object-cover object-top drop-shadow-[0_0_40px_rgba(13,223,114,0.12)]"
              style={{
                maskImage: "linear-gradient(to bottom, black calc(100% - 180px), transparent calc(100% - 20px))",
                WebkitMaskImage: "linear-gradient(to bottom, black calc(100% - 180px), transparent calc(100% - 20px))",
              }}
              fetchPriority="high"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
