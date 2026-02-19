import type { MetadataRoute } from "next";
import { storyblokFetch } from "@/lib/storyblok-fetch";

export const dynamic = "force-dynamic";

interface StoryEntry {
  slug: string;
  published_at?: string;
  updated_at?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://szamowski.dev";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/case-studies`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.6,
    },
  ];

  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const result = await storyblokFetch("cdn/stories", {
      starts_with: "blog/",
      content_type: "article",
      per_page: 100,
    });
    blogEntries = ((result.stories || []) as StoryEntry[]).map((story) => ({
      url: `${baseUrl}/blog/${story.slug}`,
      lastModified: new Date(story.published_at || story.updated_at || Date.now()),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {
    // Storyblok unreachable — return static pages only
  }

  let caseStudyEntries: MetadataRoute.Sitemap = [];
  try {
    const result = await storyblokFetch("cdn/stories", {
      starts_with: "case-studies/",
      content_type: "case_study",
      per_page: 100,
    });
    caseStudyEntries = ((result.stories || []) as StoryEntry[]).map((story) => ({
      url: `${baseUrl}/case-studies/${story.slug}`,
      lastModified: new Date(story.published_at || story.updated_at || Date.now()),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {
    // graceful fallback
  }

  return [...staticPages, ...blogEntries, ...caseStudyEntries];
}
