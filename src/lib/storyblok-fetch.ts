const STORYBLOK_BASE = "https://api.storyblok.com/v2";

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
  const response = await fetch(url, {
    redirect: "follow",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Storyblok API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}
