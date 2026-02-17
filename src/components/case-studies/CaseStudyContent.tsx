import Image from "next/image";
import Tag from "@/components/ui/Tag";
import { render } from "storyblok-rich-text-react-renderer";

interface CaseStudyContentProps {
  story: {
    content: {
      title: string;
      excerpt?: string;
      thumbnail?: { filename: string; alt?: string };
      content?: unknown;
      tech_stack?: string;
      tags?: string;
    };
  };
}

export default function CaseStudyContent({ story }: CaseStudyContentProps) {
  const { content } = story;

  return (
    <div>
      {content.thumbnail?.filename && (
        <div className="relative h-64 sm:h-96 rounded-2xl overflow-hidden mb-8">
          <Image
            src={content.thumbnail.filename}
            alt={content.thumbnail.alt || content.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
        </div>
      )}

      <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">
        {content.title}
      </h1>

      {content.excerpt && (
        <p className="text-lg text-gray-400 mb-6">{content.excerpt}</p>
      )}

      {content.tech_stack && (
        <div className="flex flex-wrap gap-2 mb-8">
          {content.tech_stack
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
            .map((tech) => (
              <Tag key={tech}>{tech}</Tag>
            ))}
        </div>
      )}

      <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-a:text-brand prose-strong:text-white prose-code:text-brand-secondary">
        {render(content.content)}
      </div>

      {content.tags && (
        <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-white/10">
          <span className="text-sm text-gray-500 mr-2">Tags:</span>
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
  );
}
