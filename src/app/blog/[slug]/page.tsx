import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStoryblokApi } from "@/lib/storyblok";
import { getStoryblokVersion } from "@/lib/utils";
import BlogPostContent from "@/components/blog/BlogPostContent";
import RelatedPosts from "@/components/blog/RelatedPosts";
import ShareLinks from "@/components/ui/ShareLinks";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const storyblokApi = getStoryblokApi();
  const version = getStoryblokVersion();

  try {
    const { data } = await storyblokApi.get(`cdn/stories/articles/${slug}`, {
      version,
    });
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
  const storyblokApi = getStoryblokApi();
  const version = getStoryblokVersion();

  let story;
  try {
    const { data } = await storyblokApi.get(`cdn/stories/articles/${slug}`, {
      version,
    });
    story = data.story;
  } catch {
    notFound();
  }

  const tags: string[] = story.content.tags || [];

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
      <BlogPostContent story={story} />
      <ShareLinks url={`/blog/${slug}`} title={story.content.title} />
      <RelatedPosts tags={tags} currentSlug={slug} />
    </article>
  );
}
