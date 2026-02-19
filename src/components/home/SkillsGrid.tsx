import GlassCard from "@/components/ui/GlassCard";
import TerminalHeading from "@/components/effects/TerminalReveal";
import { getTechIcon } from "@/lib/tech-icons";

interface SkillsGridProps {
  skills: string[];
}

export default function SkillsGrid({ skills }: SkillsGridProps) {
  return (
    <section className="max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <TerminalHeading
        text="The Toolkit"
        highlight="The Toolkit"
        className="text-3xl sm:text-4xl font-bold mb-8"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {skills.map((skill) => {
          const Icon = getTechIcon(skill);
          return (
            <GlassCard key={skill} hover className="p-4 flex items-center gap-3">
              {Icon && <Icon className="w-5 h-5 text-brand shrink-0" />}
              <span className="text-sm text-gray-300">{skill}</span>
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
}
