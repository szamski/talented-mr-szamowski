export interface StoryblokArticle {
  uuid: string;
  slug: string;
  content: {
    title: string;
    excerpt: string;
    content?: unknown;
    featured_image?: { filename: string; alt?: string };
    tags?: string;
    published_at?: string;
    author?: string;
  };
}
