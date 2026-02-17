import { storyblokFetch } from "./storyblok-fetch";
import cvFallback from "../../maciek_szamowski_cv.json";

export interface ProfileData {
  personal: {
    name: string;
    headline: string;
    tagline: string;
    phone: string;
    email: string;
    location: string;
  };
  profile: string;
  target_roles: string[];
  experience: {
    title: string;
    company: string;
    company_description: string;
    period: string;
    achievements: string[];
  }[];
  tech_projects: {
    name: string;
    description: string;
    tech_stack: string[];
  }[];
  skills: string[];
}

function parseLines(text: string): string[] {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseComma(text: string): string[] {
  return text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function getProfileData(): Promise<ProfileData> {
  try {
    // Find profile by content_type (resilient to slug/folder changes)
    const data = await storyblokFetch("cdn/stories", {
      content_type: "profile",
      per_page: 1,
    });
    if (!data.stories?.length) throw new Error("No profile story found");
    const content = data.stories[0].content;
    console.log("[Storyblok] Profile loaded, name:", content.name);

    return {
      personal: {
        name: content.name || cvFallback.personal.name,
        headline: content.headline || cvFallback.personal.headline,
        tagline: content.tagline || "DIGITAL ONE MAN ARMY",
        phone: content.phone || cvFallback.personal.phone,
        email: content.email || cvFallback.personal.email,
        location: content.location || cvFallback.personal.location,
      },
      profile: content.profile_text || cvFallback.profile,
      target_roles:
        typeof content.target_roles === "string" && content.target_roles
          ? parseLines(content.target_roles)
          : cvFallback.target_roles,
      experience: content.experience?.length
        ? content.experience.map(
            (exp: {
              title: string;
              company: string;
              company_description: string;
              period: string;
              achievements: string;
            }) => ({
              title: exp.title,
              company: exp.company,
              company_description: exp.company_description,
              period: exp.period,
              achievements:
                typeof exp.achievements === "string"
                  ? parseLines(exp.achievements)
                  : exp.achievements || [],
            })
          )
        : cvFallback.experience,
      tech_projects: content.tech_projects?.length
        ? content.tech_projects.map(
            (proj: {
              name: string;
              description: string;
              tech_stack: string;
            }) => ({
              name: proj.name,
              description: proj.description,
              tech_stack:
                typeof proj.tech_stack === "string"
                  ? parseComma(proj.tech_stack)
                  : proj.tech_stack || [],
            })
          )
        : cvFallback.tech_projects,
      skills:
        typeof content.skills === "string" && content.skills
          ? parseLines(content.skills)
          : cvFallback.skills,
    };
  } catch (error) {
    console.error("[Storyblok] Profile fetch failed, using fallback:", error);
    return {
      ...cvFallback,
      personal: {
        ...cvFallback.personal,
        tagline: "DIGITAL ONE MAN ARMY",
      },
    };
  }
}
