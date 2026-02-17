import Image from "next/image";
import Button from "@/components/ui/Button";

interface HeroSectionProps {
  name: string;
  headline: string;
  tagline: string;
}

export default function HeroSection({ name, headline, tagline }: HeroSectionProps) {
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

        {/* Photo */}
        <div className="relative hidden lg:flex justify-center animate-fade-in">
          <div className="relative w-80 h-80 xl:w-96 xl:h-96">
            {/* Glow behind photo */}
            <div className="absolute inset-0 bg-brand/20 rounded-full blur-[60px]" />
            <div className="relative w-full h-full rounded-3xl overflow-hidden border-2 border-brand/20 shadow-[0_0_40px_rgba(13,223,114,0.15)]">
              <Image
                src="/images/szama.jpg"
                alt="Maciej Szamowski"
                fill
                className="object-cover object-top"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
