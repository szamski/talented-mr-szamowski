import Image from "next/image";
import GlassCard from "@/components/ui/GlassCard";
import Tag from "@/components/ui/Tag";

interface AboutSectionProps {
  profile: string;
  targetRoles: string[];
  portrait: { url: string; alt: string };
  gallery: { image: { url: string; alt: string }; caption: string; position: string }[];
}

export default function AboutSection({
  profile,
  targetRoles,
  portrait,
  gallery,
}: AboutSectionProps) {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
      <h2 className="text-3xl sm:text-4xl font-bold mb-8">
        The Art of <span className="text-gradient">Adaptability</span>
      </h2>
      <GlassCard className="p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Photo */}
          <div className="relative mx-auto md:mx-0">
            <div className="relative w-48 h-48 md:w-full md:h-64 rounded-2xl overflow-hidden border border-white/10">
              <Image
                src={portrait.url}
                alt={portrait.alt}
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
        {gallery.map((item, i) => (
          <div
            key={i}
            className={`relative h-40 rounded-xl overflow-hidden glass${i === 2 ? " hidden md:block" : ""}`}
          >
            <Image
              src={item.image.url}
              alt={item.image.alt}
              fill
              className="object-cover"
              style={{ objectPosition: item.position }}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
            <span className="absolute bottom-3 left-3 text-xs text-white/80 font-medium">
              {item.caption}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
