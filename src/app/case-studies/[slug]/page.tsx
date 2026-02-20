import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { storyblokFetch } from "@/lib/storyblok-fetch";
import CaseStudyContent from "@/components/case-studies/CaseStudyContent";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const data = await storyblokFetch(`cdn/stories/case-studies/${slug}`);
    return {
      title: data.story.content.title,
      description: data.story.content.excerpt,
    };
  } catch {
    return { title: "Case Study Not Found" };
  }
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;

  let story;
  try {
    const data = await storyblokFetch(`cdn/stories/case-studies/${slug}`);
    story = data.story;
  } catch {
    notFound();
  }

  return (
    <article className="max-w-3xl 2xl:max-w-4xl mx-auto px-4 sm:px-6 py-20">
      <Link
        href="/case-studies"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-brand transition-colors mb-8"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        All Case Studies
      </Link>
      <CaseStudyContent story={story} />
    </article>
  );
}
