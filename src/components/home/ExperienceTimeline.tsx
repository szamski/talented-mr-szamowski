import GlassCard from "@/components/ui/GlassCard";
import TerminalHeading from "@/components/effects/TerminalReveal";

interface Experience {
  title: string;
  company: string;
  company_description: string;
  period: string;
  achievements: string[];
}

interface ExperienceTimelineProps {
  experience: Experience[];
}

export default function ExperienceTimeline({
  experience,
}: ExperienceTimelineProps) {
  return (
    <section id="experience" className="max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <TerminalHeading
        text="A History of Impact"
        highlight="A History of Impact"
        className="text-2xl sm:text-4xl font-bold mb-8 sm:mb-12"
      />

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-brand/20 sm:-translate-x-px" />

        <div className="space-y-8">
          {experience.map((exp, index) => (
            <div
              key={`${exp.company}-${exp.period}`}
              className={`relative flex flex-col sm:flex-row gap-4 sm:gap-8 ${
                index % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
              }`}
            >
              {/* Timeline dot */}
              <div className="absolute left-4 sm:left-1/2 w-3 h-3 bg-brand rounded-full -translate-x-1.5 sm:-translate-x-1.5 mt-6 z-10 shadow-[0_0_10px_rgba(13,223,114,0.5)]" />

              {/* Spacer for alignment */}
              <div className="hidden sm:block sm:w-1/2" />

              {/* Card */}
              <div className="ml-10 sm:ml-0 sm:w-1/2">
                <GlassCard hover className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3">
                    <h3 className="text-lg font-semibold text-white">
                      {exp.title}
                    </h3>
                    <span className="text-xs text-brand font-medium">
                      {exp.period}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">
                    <span className="text-brand-secondary font-medium">
                      {exp.company}
                    </span>{" "}
                    &mdash; {exp.company_description}
                  </p>
                  <ul className="space-y-1.5">
                    {exp.achievements.map((achievement, i) => (
                      <li
                        key={i}
                        className="text-sm text-gray-400 pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-brand/40 before:rounded-full"
                      >
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
