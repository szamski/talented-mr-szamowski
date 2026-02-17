import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { storyblokFetch } from "@/lib/storyblok";
import BlogPostContent from "@/components/blog/BlogPostContent";
import RelatedPosts from "@/components/blog/RelatedPosts";
import ShareLinks from "@/components/ui/ShareLinks";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const data = await storyblokFetch(`cdn/stories/articles/${slug}`);
    return {
      title: data.story.content.title,
      description: data.story.content.excerpt,
    };
  } catch {
    return { title: "Post Not Found" };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  let story;
  try {
    const data = await storyblokFetch(`cdn/stories/articles/${slug}`);
    story = data.story;
  } catch {
    notFound();
  }

  const tags: string[] = story.content.tags
    ? story.content.tags
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean)
    : [];

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
      <BlogPostContent story={story} />
      <ShareLinks url={`/blog/${slug}`} title={story.content.title} />
      <RelatedPosts tags={tags} currentSlug={slug} />
    </article>
  );
}
