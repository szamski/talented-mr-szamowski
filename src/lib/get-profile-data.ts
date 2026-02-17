import { storyblokFetch } from "./storyblok-fetch";
import cvFallback from "../../maciek_szamowski_cv.json";

export interface StoryblokImage {
  url: string;
  alt: string;
}

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
  images: {
    headshot: StoryblokImage;
    portrait: StoryblokImage;
    gallery: { image: StoryblokImage; caption: string }[];
  };
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
    thumbnail?: StoryblokImage;
    slug?: string;
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
    console.log("[Storyblok] content keys:", Object.keys(content));
    console.log("[Storyblok] Profile loaded, name:", content.name);
    console.log("[Storyblok] headshot:", JSON.stringify(content.headshot)?.slice(0, 200));

    const assetUrl = (field: { filename?: string; alt?: string } | undefined, fallback: string) =>
      field?.filename || fallback;
    const assetAlt = (field: { filename?: string; alt?: string } | undefined, fallback: string) =>
      field?.alt || fallback;

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
      images: {
        headshot: {
          url: assetUrl(content.headshot, "/images/szama.jpg"),
          alt: assetAlt(content.headshot, "Maciej Szamowski"),
        },
        portrait: {
          url: assetUrl(content.portrait, "/images/DSC04666.jpg"),
          alt: assetAlt(content.portrait, "Maciej Szamowski - B&W portrait"),
        },
        gallery: [
          {
            image: {
              url: assetUrl(content.gallery_1, "/images/96fb7a55-4414-411d-bca4-a08fc583555c.jpg"),
              alt: assetAlt(content.gallery_1, "Speaking at TikTok event"),
            },
            caption: content.gallery_1_caption || "TikTok CEE",
          },
          {
            image: {
              url: assetUrl(content.gallery_2, "/images/2024-11-18.jpg"),
              alt: assetAlt(content.gallery_2, "At ISART Digital gaming wall"),
            },
            caption: content.gallery_2_caption || "ISART Digital",
          },
          {
            image: {
              url: assetUrl(content.gallery_3, "/images/IMG_0747.jpeg"),
              alt: assetAlt(content.gallery_3, "Maciej at event"),
            },
            caption: content.gallery_3_caption || "Conference",
          },
        ],
      },
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
              thumbnail?: { filename?: string; alt?: string };
              slug?: string;
            }) => ({
              name: proj.name,
              description: proj.description,
              tech_stack:
                typeof proj.tech_stack === "string"
                  ? parseComma(proj.tech_stack)
                  : proj.tech_stack || [],
              thumbnail: proj.thumbnail?.filename
                ? { url: proj.thumbnail.filename, alt: proj.thumbnail.alt || proj.name }
                : undefined,
              slug: proj.slug || undefined,
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
      images: {
        headshot: { url: "/images/szama.jpg", alt: "Maciej Szamowski" },
        portrait: { url: "/images/DSC04666.jpg", alt: "Maciej Szamowski - B&W portrait" },
        gallery: [
          { image: { url: "/images/96fb7a55-4414-411d-bca4-a08fc583555c.jpg", alt: "Speaking at TikTok event" }, caption: "TikTok CEE" },
          { image: { url: "/images/2024-11-18.jpg", alt: "At ISART Digital gaming wall" }, caption: "ISART Digital" },
          { image: { url: "/images/IMG_0747.jpeg", alt: "Maciej at event" }, caption: "Conference" },
        ],
      },
    };
  }
}
