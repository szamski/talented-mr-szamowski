import Image from "next/image";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import Tag from "@/components/ui/Tag";
import { formatDate } from "@/lib/utils";
import type { StoryblokArticle } from "@/lib/types";

interface BlogCardProps {
  story: StoryblokArticle;
}

export default function BlogCard({ story }: BlogCardProps) {
  const { content, slug } = story;

  return (
    <Link href={`/blog/${slug}`} className="block group">
      <GlassCard hover className="overflow-hidden">
        {content.featured_image?.filename && (
          <div className="relative h-48 overflow-hidden rounded-t-2xl">
            <Image
              src={content.featured_image.filename}
              alt={content.featured_image.alt || content.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
            {content.published_at && (
              <time>{formatDate(content.published_at)}</time>
            )}
            {content.author && <span>&middot; {content.author}</span>}
          </div>
          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-brand transition-colors">
            {content.title}
          </h3>
          <p className="text-sm text-gray-400 mb-4 line-clamp-2">
            {content.excerpt}
          </p>
          {content.tags && (
            <div className="flex flex-wrap gap-2">
              {content.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
                .map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
            </div>
          )}
        </div>
      </GlassCard>
    </Link>
  );
}
