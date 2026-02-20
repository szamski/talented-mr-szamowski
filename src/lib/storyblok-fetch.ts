import { unstable_cache } from "next/cache";

const STORYBLOK_CDN = "https://api.storyblok.com/v2";
const STORYBLOK_MAPI = "https://mapi.storyblok.com/v1";
const SPACE_ID = "290596128883130";

// Cache TTL in seconds — the /api/revalidate webhook clears this on publish.
// Set high because webhook-driven invalidation handles freshness.
const CACHE_TTL = 3600;

async function _storyblokFetch(
  path: string,
  params: Record<string, string | number> = {},
  draft = false
) {
  const cdnToken = process.env.STORYBLOK_API_TOKEN;
  const mgmtToken = process.env.STORYBLOK_MANAGEMENT_TOKEN;

  // Try CDN API first (fast, reliable, region-aware)
  if (cdnToken) {
    try {
      return await cdnQuery(path, params, cdnToken, draft);
    } catch (error) {
      console.warn("[Storyblok] CDN failed, trying MAPI fallback:", error);
    }
  }

  // Fallback to Management API (works globally, but strict rate limits)
  if (mgmtToken) {
    return mapiQuery(path, params, mgmtToken);
  }

  throw new Error("Missing both STORYBLOK_API_TOKEN and STORYBLOK_MANAGEMENT_TOKEN");
}

async function cdnQuery(
  path: string,
  params: Record<string, string | number>,
  token: string,
  draft: boolean
) {
  const searchParams = new URLSearchParams({
    token,
    version: draft ? "draft" : "published",
    ...Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ),
  });

  const url = `${STORYBLOK_CDN}/${path}?${searchParams}`;
  const response = await fetch(url, {
    redirect: "follow",
    next: { revalidate: CACHE_TTL, tags: ["storyblok"] },
  });
  if (!response.ok) {
    throw new Error(`Storyblok CDN error: ${response.status}`);
  }
  return response.json();
}

// Wrap with unstable_cache so responses are shared across concurrent requests
// and cached on the server for CACHE_TTL seconds. The /api/revalidate webhook
// invalidates the "storyblok" tag on every CMS publish event.
function createCachedFetch(draft: boolean) {
  return unstable_cache(
    (path: string, params: Record<string, string | number> = {}) =>
      _storyblokFetch(path, params, draft),
    ["storyblok-fetch", draft ? "draft" : "published"],
    { revalidate: CACHE_TTL, tags: ["storyblok"] }
  );
}

const cachedPublished = createCachedFetch(false);
const cachedDraft = createCachedFetch(true);

export function storyblokFetch(
  path: string,
  params: Record<string, string | number> = {},
  draft = false
) {
  return draft ? cachedDraft(path, params) : cachedPublished(path, params);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function mapiFetch(url: string, token: string, retries = 3): Promise<any> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(url, {
      headers: { Authorization: token },
      cache: "no-store",
    });
    if (response.status === 429 && attempt < retries) {
      const wait = Math.min(1000 * 2 ** attempt, 10000);
      console.warn(`[Storyblok] MAPI 429, retry ${attempt + 1} in ${wait}ms`);
      await new Promise((r) => setTimeout(r, wait));
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

    // Fetch full content in parallel batches of 5 to respect rate limits
    const fullStories = [];
    const batchSize = 5;
    for (let i = 0; i < (stories as { id: number }[]).length; i += batchSize) {
      const batch = (stories as { id: number }[]).slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map((s) => mapiFetch(`${base}/stories/${s.id}`, token).then((d) => d.story))
      );
      fullStories.push(...results);
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
