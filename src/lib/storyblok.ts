import { apiPlugin, storyblokInit } from "@storyblok/react/rsc";

// SDK init for visual editor bridge
export const getStoryblokApi = storyblokInit({
  accessToken: process.env.STORYBLOK_API_TOKEN,
  use: [apiPlugin],
  components: {},
});

const STORYBLOK_BASE = "https://api.storyblok.com/v2";

// Direct fetch wrapper that follows redirects (SDK doesn't follow 301s for EU spaces)
export async function storyblokFetch(
  path: string,
  params: Record<string, string | number> = {}
) {
  const token = process.env.STORYBLOK_API_TOKEN;
  if (!token) throw new Error("Missing STORYBLOK_API_TOKEN");

  const searchParams = new URLSearchParams({
    token,
    version: "draft",
    cv: String(Date.now()),
    ...Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ),
  });

  const url = `${STORYBLOK_BASE}/${path}?${searchParams}`;
  const response = await fetch(url, { redirect: "follow" });

  if (!response.ok) {
    throw new Error(`Storyblok API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
