import GlassCard from "@/components/ui/GlassCard";
import { getTechIcon } from "@/lib/tech-icons";

interface SkillsGridProps {
  skills: string[];
}

export default function SkillsGrid({ skills }: SkillsGridProps) {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
      <h2 className="text-3xl sm:text-4xl font-bold mb-8">
        <span className="text-gradient">The Toolkit</span>
      </h2>
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
