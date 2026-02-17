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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function mapiFetch(url: string, token: string, retries = 3): Promise<any> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(url, {
      headers: { Authorization: token },
      cache: "no-store",
    });
    if (response.status === 429 && attempt < retries) {
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      continue;
    }
    if (!response.ok) {
      throw new Error(`Storyblok MAPI error: ${response.status}`);
    }
    return response.json();
  }
  throw new Error("Storyblok MAPI: max retries exceeded");
}

async function mapiQuery(
  path: string,
  params: Record<string, string | number>,
  token: string
) {
  const base = `${STORYBLOK_MAPI}/spaces/${SPACE_ID}`;

  // List stories: cdn/stories
  if (path === "cdn/stories") {
    // MAPI doesn't support content_type filter — we need to fetch stories
    // and filter by component type in the full content ourselves
    const contentType = params.content_type as string | undefined;
    const mapiParams = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      // Skip content_type — MAPI doesn't support it properly
      if (k === "content_type") continue;
      mapiParams.set(k, String(v));
    }

    // If content_type is set, fetch more stories so we can filter
    if (contentType) {
      mapiParams.set("per_page", "25");
    }

    const listData = await mapiFetch(`${base}/stories?${mapiParams}`, token);
    const stories = listData.stories || [];

    // Fetch full content for each story (sequential to avoid rate limits)
    const fullStories = [];
    for (const s of stories as { id: number }[]) {
      const detail = await mapiFetch(`${base}/stories/${s.id}`, token);
      fullStories.push(detail.story);
    }

    // Filter by component type if content_type was specified
    const filtered = contentType
      ? fullStories.filter(
          (s: { content?: { component?: string } }) =>
            s.content?.component === contentType
        )
      : fullStories;

    // Apply per_page limit from original params
    const perPage = params.per_page ? Number(params.per_page) : filtered.length;
    const result = filtered.slice(0, perPage);

    return { stories: result, total: filtered.length };
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
