import type { Metadata } from "next";
import { storyblokFetch } from "@/lib/storyblok-fetch";
import { getProfileData } from "@/lib/get-profile-data";
import BlogCard from "@/components/blog/BlogCard";
import Pagination from "@/components/ui/Pagination";
import Tag from "@/components/ui/Tag";
import GlassCard from "@/components/ui/GlassCard";
import type { StoryblokArticle } from "@/lib/types";

export const metadata: Metadata = {
  title: "Blog",
  description: "Thoughts on marketing, technology, and business strategy.",
};

interface BlogPageProps {
  searchParams: Promise<{ page?: string; tag?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const perPage = 5;
  const tag = params.tag;

  const fetchParams: Record<string, string | number> = {
    starts_with: "blog/",
    content_type: "article",
    per_page: perPage,
    page,
    sort_by: "content.published_at:desc",
  };
  if (tag) {
    fetchParams["filter_query[tags][any_in_array]"] = tag;
  }

  // Run both fetches in parallel — they are independent of each other
  const [profileData, storiesResult] = await Promise.all([
    getProfileData(),
    storyblokFetch("cdn/stories", fetchParams).catch(() => ({ stories: [], total: 0 })),
  ]);

  const stories: StoryblokArticle[] = storiesResult.stories ?? [];
  const total: number = storiesResult.total ?? 0;

  const totalPages = Math.ceil(total / perPage);

  return (
    <section className="max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 py-20">
      <h1 className="text-4xl sm:text-5xl font-bold mb-4">
        <span className="text-gradient">Blog</span>
      </h1>
      <p className="text-gray-400 mb-8">
        {profileData.pages.blog_description}
      </p>

      {tag && (
        <div className="mb-8 flex items-center gap-2">
          <span className="text-sm text-gray-500">Filtered by:</span>
          <Tag>{tag}</Tag>
          <a href="/blog" className="text-xs text-gray-500 hover:text-brand ml-2">
            Clear
          </a>
        </div>
      )}

      {stories.length > 0 ? (
        <>
          <div className="grid gap-6">
            {stories.map((story) => (
              <BlogCard key={story.uuid} story={story} />
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/blog"
          />
        </>
      ) : (
        <GlassCard className="p-8 text-center">
          <p className="text-gray-400">
            No blog posts yet. Check back soon!
          </p>
        </GlassCard>
      )}
    </section>
  );
}
