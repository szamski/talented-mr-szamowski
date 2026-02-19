import { storyblokFetch } from "@/lib/storyblok-fetch";
import type { StoryblokArticle } from "@/lib/types";
import BlogCard from "./BlogCard";

interface RelatedPostsProps {
  tags: string[];
  currentSlug: string;
}

export default async function RelatedPosts({
  tags,
  currentSlug,
}: RelatedPostsProps) {
  if (!tags.length) return null;

  try {
    const data = await storyblokFetch("cdn/stories", {
      starts_with: "blog/",
      content_type: "article",
      per_page: 3,
      excluding_slugs: `blog/${currentSlug}`,
      "filter_query[tags][any_in_array]": tags.join(","),
    });

    if (!data.stories.length) return null;

    return (
      <section className="mt-16 pt-8 border-t border-white/10">
        <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
        <div className="grid gap-6">
          {data.stories.map((story: StoryblokArticle) => (
            <BlogCard key={story.uuid} story={story} />
          ))}
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
