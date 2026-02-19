import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { storyblokFetch } from "@/lib/storyblok-fetch";
import { getProfileData } from "@/lib/get-profile-data";
import GlassCard from "@/components/ui/GlassCard";
import Tag from "@/components/ui/Tag";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "Technical projects and case studies by Maciej Szamowski — automation, analytics, and web development.",
};

interface CaseStudyStory {
  uuid: string;
  slug: string;
  content: {
    title: string;
    excerpt?: string;
    thumbnail?: { filename: string; alt?: string };
    tech_stack?: string;
  };
}

export default async function CaseStudiesPage() {
  // Run both fetches in parallel — they are independent of each other
  const [profileData, storiesResult] = await Promise.all([
    getProfileData(),
    storyblokFetch("cdn/stories", {
      starts_with: "case-studies/",
      content_type: "case_study",
      per_page: 20,
    }).catch(() => ({ stories: [] })),
  ]);

  const stories: CaseStudyStory[] = storiesResult.stories ?? [];

  return (
    <section className="max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 py-20">
      <h1 className="text-4xl sm:text-5xl font-bold mb-4">
        Selected <span className="text-gradient">Works</span>
      </h1>
      <p className="text-gray-400 mb-10">
        {profileData.pages.case_studies_description}
      </p>

      {stories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stories.map((story) => (
            <Link
              key={story.uuid}
              href={`/case-studies/${story.slug}`}
              className="block transition-transform hover:scale-[1.01]"
            >
              <GlassCard hover className="overflow-hidden h-full">
                {story.content.thumbnail?.filename && (
                  <div className="relative h-44 w-full">
                    <Image
                      src={story.content.thumbnail.filename}
                      alt={story.content.thumbnail.alt || story.content.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-white mb-2">
                    {story.content.title}
                  </h2>
                  {story.content.excerpt && (
                    <p className="text-sm text-gray-400 mb-4">
                      {story.content.excerpt}
                    </p>
                  )}
                  {story.content.tech_stack && (
                    <div className="flex flex-wrap gap-2">
                      {story.content.tech_stack
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)
                        .map((tech) => (
                          <Tag key={tech} icon>{tech}</Tag>
                        ))}
                    </div>
                  )}
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      ) : (
        <GlassCard className="p-8 text-center">
          <p className="text-gray-400">
            Case studies coming soon. Check back later!
          </p>
        </GlassCard>
      )}
    </section>
  );
}
