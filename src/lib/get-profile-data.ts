import { getStoryblokApi } from "./storyblok";
import { getStoryblokVersion } from "./utils";
import cvFallback from "../../maciek_szamowski_cv.json";

export interface ProfileData {
  personal: {
    name: string;
    headline: string;
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

export async function getProfileData(): Promise<ProfileData> {
  try {
    const storyblokApi = getStoryblokApi();
    const version = getStoryblokVersion();
    const { data } = await storyblokApi.get("cdn/stories/profile", {
      version,
    });

    const content = data.story.content;

    return {
      personal: {
        name: content.name || cvFallback.personal.name,
        headline: content.headline || cvFallback.personal.headline,
        phone: content.phone || cvFallback.personal.phone,
        email: content.email || cvFallback.personal.email,
        location: content.location || cvFallback.personal.location,
      },
      profile: content.profile || cvFallback.profile,
      target_roles: content.target_roles?.length
        ? content.target_roles
        : cvFallback.target_roles,
      experience: content.experience?.length
        ? content.experience.map(
            (exp: {
              title: string;
              company: string;
              company_description: string;
              period: string;
              achievements: string[];
            }) => ({
              title: exp.title,
              company: exp.company,
              company_description: exp.company_description,
              period: exp.period,
              achievements: exp.achievements || [],
            })
          )
        : cvFallback.experience,
      tech_projects: content.tech_projects?.length
        ? content.tech_projects.map(
            (proj: {
              name: string;
              description: string;
              tech_stack: string[];
            }) => ({
              name: proj.name,
              description: proj.description,
              tech_stack: proj.tech_stack || [],
            })
          )
        : cvFallback.tech_projects,
      skills: content.skills?.length ? content.skills : cvFallback.skills,
    };
  } catch {
    // Storyblok not configured or "profile" story doesn't exist yet - use JSON fallback
    return cvFallback;
  }
}
