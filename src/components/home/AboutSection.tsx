import Image from "next/image";
import { render } from "storyblok-rich-text-react-renderer";
import GlassCard from "@/components/ui/GlassCard";
import Tag from "@/components/ui/Tag";
import TerminalHeading from "@/components/effects/TerminalReveal";

interface AboutSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile: any;
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
    <section className="max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <TerminalHeading
        text="The Art of Adaptability"
        highlight="Adaptability"
        className="text-3xl sm:text-4xl font-bold mb-8"
      />
      <GlassCard className="p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Photo */}
          <div className="relative">
            <div className="relative w-full h-64 md:h-full md:min-h-64 rounded-2xl overflow-hidden border border-white/10">
              <Image
                src={portrait.url}
                alt={portrait.alt}
                fill
                className="object-cover object-[50%_100%] md:object-[25%_55%] sm:object-[25%_50%]"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
            </div>
          </div>

          {/* Text */}
          <div className="md:col-span-2">
            <div className="prose prose-invert prose-lg max-w-none mb-6 [&_p]:text-gray-300 [&_p]:leading-relaxed">
              {render(profile)}
            </div>
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
