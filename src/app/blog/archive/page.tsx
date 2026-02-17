import type { Metadata } from "next";
import Link from "next/link";
import { storyblokFetch } from "@/lib/storyblok";
import GlassCard from "@/components/ui/GlassCard";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog Archive",
};

interface Story {
  slug: string;
  content: {
    title: string;
    published_at?: string;
  };
}

export default async function ArchivePage() {
  let stories: Story[] = [];

  try {
    const data = await storyblokFetch("cdn/stories", {
      starts_with: "articles/",
      content_type: "article",
      per_page: 100,
      sort_by: "content.published_at:desc",
    });
    stories = data.stories;
  } catch {
    // Storyblok not configured yet
  }

  // Group stories by month/year
  const grouped: Record<string, Story[]> = {};
  for (const story of stories) {
    const date = story.content.published_at
      ? new Date(story.content.published_at)
      : new Date();
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(story);
  }

  const months = Object.keys(grouped).sort().reverse();

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
      <h1 className="text-4xl sm:text-5xl font-bold mb-4">
        <span className="text-gradient">Archive</span>
      </h1>
      <p className="text-gray-400 mb-8">All blog posts organized by month.</p>

      {months.length > 0 ? (
        <div className="space-y-6">
          {months.map((month) => {
            const date = new Date(`${month}-01`);
            const label = date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
            });
            return (
              <GlassCard key={month} className="p-6">
                <h2 className="text-lg font-semibold text-white mb-3">
                  {label}{" "}
                  <span className="text-sm text-gray-500">
                    ({grouped[month].length} post
                    {grouped[month].length !== 1 ? "s" : ""})
                  </span>
                </h2>
                <ul className="space-y-2">
                  {grouped[month].map((story) => (
                    <li key={story.slug}>
                      <Link
                        href={`/blog/${story.slug}`}
                        className="text-sm text-gray-400 hover:text-brand transition-colors"
                      >
                        {story.content.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <GlassCard className="p-8 text-center">
          <p className="text-gray-400">No posts archived yet.</p>
        </GlassCard>
      )}
    </section>
  );
}
