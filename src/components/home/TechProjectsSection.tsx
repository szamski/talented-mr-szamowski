import Image from "next/image";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import Tag from "@/components/ui/Tag";
import TerminalHeading from "@/components/effects/TerminalReveal";

interface TechProject {
  name: string;
  description: string;
  tech_stack: string[];
  thumbnail?: { url: string; alt: string };
  slug?: string;
}

interface TechProjectsSectionProps {
  projects: TechProject[];
}

export default function TechProjectsSection({
  projects,
}: TechProjectsSectionProps) {
  return (
    <section className="max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <TerminalHeading
        text="Selected Works"
        highlight="Works"
        className="text-3xl sm:text-4xl font-bold mb-8"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => {
          const card = (
            <GlassCard key={project.name} hover className="overflow-hidden">
              {project.thumbnail && (
                <div className="relative h-44 w-full">
                  <Image
                    src={project.thumbnail.url}
                    alt={project.thumbnail.alt}
                    fill
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tech_stack.map((tech) => (
                    <Tag key={tech} icon>{tech}</Tag>
                  ))}
                </div>
              </div>
            </GlassCard>
          );

          if (project.slug) {
            return (
              <Link
                key={project.name}
                href={`/case-studies/${project.slug}`}
                className="block transition-transform hover:scale-[1.01]"
              >
                {card}
              </Link>
            );
          }

          return card;
        })}
      </div>
    </section>
  );
}
