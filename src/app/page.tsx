import HeroSection from "@/components/home/HeroSection";
import AboutSection from "@/components/home/AboutSection";
import ExperienceTimeline from "@/components/home/ExperienceTimeline";
import SkillsGrid from "@/components/home/SkillsGrid";
import TechProjectsSection from "@/components/home/TechProjectsSection";
import ClientsSection from "@/components/home/ClientsSection";
import { getProfileData } from "@/lib/get-profile-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getProfileData();

  return (
    <>
      <HeroSection
        name={data.personal.name}
        headline={data.personal.headline}
        tagline={data.personal.tagline}
        headshot={data.images.headshot}
      />
      <AboutSection
        profile={data.profile}
        targetRoles={data.target_roles}
        portrait={data.images.portrait}
        gallery={data.images.gallery}
      />
      <ExperienceTimeline experience={data.experience} />
      <SkillsGrid skills={data.skills} />
      <TechProjectsSection projects={data.tech_projects} />
      <ClientsSection clients={data.clients} />
    </>
  );
}
