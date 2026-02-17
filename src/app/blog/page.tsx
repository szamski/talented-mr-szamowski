import type { Metadata } from "next";
import { getStoryblokApi } from "@/lib/storyblok";
import { getStoryblokVersion } from "@/lib/utils";
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
  const version = getStoryblokVersion();

  const storyblokApi = getStoryblokApi();

  let stories: StoryblokArticle[] = [];
  let total = 0;

  try {
    const response = await storyblokApi.get("cdn/stories", {
      version,
      starts_with: "articles/",
      content_type: "article",
      per_page: perPage,
      page,
      sort_by: "content.published_date:desc",
      ...(tag && {
        filter_query: {
          tags: { any_in_array: tag },
        },
      }),
    });
    stories = response.data.stories;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const headers = response.headers as any;
    total = headers?.total ? Number(headers.total) : 0;
  } catch {
    // Storyblok not configured yet - show empty state
  }

  const totalPages = Math.ceil(total / perPage);

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
      <h1 className="text-4xl sm:text-5xl font-bold mb-4">
        <span className="text-gradient">Blog</span>
      </h1>
      <p className="text-gray-400 mb-8">
        Thoughts on marketing, technology, and business strategy.
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
