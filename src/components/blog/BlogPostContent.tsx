import Image from "next/image";
import Tag from "@/components/ui/Tag";
import { formatDate } from "@/lib/utils";
import { render } from "storyblok-rich-text-react-renderer";
import type { StoryblokArticle } from "@/lib/types";

interface BlogPostContentProps {
  story: StoryblokArticle;
}

export default function BlogPostContent({ story }: BlogPostContentProps) {
  const { content } = story;

  return (
    <div>
      {content.featured_image?.filename && (
        <div className="relative h-64 sm:h-96 rounded-2xl overflow-hidden mb-8">
          <Image
            src={content.featured_image.filename}
            alt={content.featured_image.alt || content.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
        {content.published_at && (
          <time>{formatDate(content.published_at)}</time>
        )}
        {content.author && <span>&middot; {content.author}</span>}
      </div>

      <h1 className="text-3xl sm:text-5xl font-bold text-white mb-6">
        {content.title}
      </h1>

      {content.tags && (
        <div className="flex flex-wrap gap-2 mb-8">
          {content.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
            .map((tag) => (
              <Tag key={tag} href={`/blog?tag=${tag}`}>
                {tag}
              </Tag>
            ))}
        </div>
      )}

      <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-a:text-brand prose-strong:text-white prose-code:text-brand-secondary">
        {render(content.content)}
      </div>
    </div>
  );
}
