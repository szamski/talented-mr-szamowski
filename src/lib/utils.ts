export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function getStoryblokVersion(): "draft" | "published" {
  // Use "draft" always since we use the preview token — this ensures
  // edits are visible immediately without waiting for CDN cache
  return "draft";
}
