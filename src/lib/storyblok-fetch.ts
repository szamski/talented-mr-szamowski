const STORYBLOK_CDN = "https://api.storyblok.com/v2";
const STORYBLOK_MAPI = "https://mapi.storyblok.com/v1";
const SPACE_ID = "290596128883130";

export async function storyblokFetch(
  path: string,
  params: Record<string, string | number> = {}
) {
  const mgmtToken = process.env.STORYBLOK_MANAGEMENT_TOKEN;
  const cdnToken = process.env.STORYBLOK_API_TOKEN;

  // Try Management API first (reliable from any region)
  if (mgmtToken) {
    return mapiQuery(path, params, mgmtToken);
  }

  // Fallback to CDN API (works locally / from EU)
  if (!cdnToken) throw new Error("Missing STORYBLOK_API_TOKEN");
  const searchParams = new URLSearchParams({
    token: cdnToken,
    version: "draft",
    cv: String(Date.now()),
    ...Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ),
  });

  const url = `${STORYBLOK_CDN}/${path}?${searchParams}`;
  const response = await fetch(url, { redirect: "follow", cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Storyblok CDN error: ${response.status}`);
  }
  return response.json();
}

async function mapiFetch(url: string, token: string) {
  const response = await fetch(url, {
    headers: { Authorization: token },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Storyblok MAPI error: ${response.status}`);
  }
  return response.json();
}

async function mapiQuery(
  path: string,
  params: Record<string, string | number>,
  token: string
) {
  const base = `${STORYBLOK_MAPI}/spaces/${SPACE_ID}`;

  // List stories: cdn/stories
  if (path === "cdn/stories") {
    const searchParams = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      searchParams.set(k, String(v));
    }

    // First get story IDs
    const listUrl = `${base}/stories?${searchParams}`;
    console.log("[MAPI] list URL:", listUrl);
    const listData = await mapiFetch(listUrl, token);
    const stories = listData.stories || [];
    console.log("[MAPI] list returned", stories.length, "stories, IDs:", stories.map((s: { id: number }) => s.id));

    // Fetch full content for each story
    const fullStories = await Promise.all(
      stories.map(async (s: { id: number }) => {
        const detail = await mapiFetch(`${base}/stories/${s.id}`, token);
        console.log("[MAPI] detail for", s.id, "content keys:", Object.keys(detail.story?.content || {}));
        return detail.story;
      })
    );

    return { stories: fullStories, total: listData.total || fullStories.length };
  }

  // Single story by slug: cdn/stories/{slug}
  if (path.startsWith("cdn/stories/")) {
    const slug = path.replace("cdn/stories/", "");
    const listData = await mapiFetch(
      `${base}/stories?with_slug=${slug}`,
      token
    );
    if (!listData.stories?.length) {
      throw new Error(`Story not found: ${slug}`);
    }
    const detail = await mapiFetch(
      `${base}/stories/${listData.stories[0].id}`,
      token
    );
    return detail;
  }

  throw new Error(`Unsupported MAPI path: ${path}`);
}
