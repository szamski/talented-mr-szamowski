import HeroSection from "@/components/home/HeroSection";
import AboutSection from "@/components/home/AboutSection";
import ExperienceTimeline from "@/components/home/ExperienceTimeline";
import SkillsGrid from "@/components/home/SkillsGrid";
import TechProjectsSection from "@/components/home/TechProjectsSection";
import { getProfileData } from "@/lib/get-profile-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getProfileData();

  // Temporary debug: test fetch directly
  let debugName = "unknown";
  try {
    const token = process.env.STORYBLOK_API_TOKEN;
    const resp = await fetch(
      `https://api.storyblok.com/v2/cdn/stories/profile?token=${token}&version=draft&cv=${Date.now()}`,
      { cache: "no-store" }
    );
    if (resp.ok) {
      const d = await resp.json();
      debugName = d.story?.content?.name || "no-name";
    } else {
      debugName = `err-${resp.status}`;
    }
  } catch (e) {
    debugName = `catch-${e}`;
  }

  return (
    <>
      {/* TEMP DEBUG - remove after fixing */}
      <div className="fixed bottom-2 right-2 z-50 bg-black/80 text-xs text-brand p-2 rounded">
        data: {data.personal.name} | direct: {debugName}
      </div>
      <HeroSection
        name={data.personal.name}
        headline={data.personal.headline}
        tagline={data.personal.tagline}
      />
      <AboutSection profile={data.profile} targetRoles={data.target_roles} />
      <ExperienceTimeline experience={data.experience} />
      <SkillsGrid skills={data.skills} />
      <TechProjectsSection projects={data.tech_projects} />
    </>
  );
}
