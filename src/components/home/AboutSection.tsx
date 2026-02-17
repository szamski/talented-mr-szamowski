import Image from "next/image";
import GlassCard from "@/components/ui/GlassCard";
import Tag from "@/components/ui/Tag";

interface AboutSectionProps {
  profile: string;
  targetRoles: string[];
}

export default function AboutSection({
  profile,
  targetRoles,
}: AboutSectionProps) {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
      <h2 className="text-3xl sm:text-4xl font-bold mb-8">
        About <span className="text-gradient">Me</span>
      </h2>
      <GlassCard className="p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Photo */}
          <div className="relative mx-auto md:mx-0">
            <div className="relative w-48 h-48 md:w-full md:h-64 rounded-2xl overflow-hidden border border-white/10">
              <Image
                src="/images/DSC04666.jpg"
                alt="Maciej Szamowski - B&W portrait"
                fill
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
            </div>
          </div>

          {/* Text */}
          <div className="md:col-span-2">
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              {profile}
            </p>
            <div className="flex flex-wrap gap-2">
              {targetRoles.map((role) => (
                <Tag key={role}>{role}</Tag>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Photo gallery strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
        <div className="relative h-40 rounded-xl overflow-hidden glass">
          <Image
            src="/images/96fb7a55-4414-411d-bca4-a08fc583555c.jpg"
            alt="Speaking at TikTok event"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          <span className="absolute bottom-3 left-3 text-xs text-white/80 font-medium">
            TikTok CEE
          </span>
        </div>
        <div className="relative h-40 rounded-xl overflow-hidden glass">
          <Image
            src="/images/2024-11-18.jpg"
            alt="At ISART Digital gaming wall"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          <span className="absolute bottom-3 left-3 text-xs text-white/80 font-medium">
            ISART Digital
          </span>
        </div>
        <div className="relative h-40 rounded-xl overflow-hidden glass hidden md:block">
          <Image
            src="/images/IMG_0747.jpeg"
            alt="Maciej at event"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          <span className="absolute bottom-3 left-3 text-xs text-white/80 font-medium">
            Conference
          </span>
        </div>
      </div>
    </section>
  );
}
