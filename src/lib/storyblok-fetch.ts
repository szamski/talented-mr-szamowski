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
  const mgmtToken = process.env.STORYBLOK_MANAGEMENT_TOKEN;
  const cdnToken = process.env.STORYBLOK_API_TOKEN;

  // Try MAPI first (works globally — reliable from US build servers and EU runtime)
  if (mgmtToken) {
    try {
      return await mapiQuery(path, params, mgmtToken);
    } catch (error) {
      console.warn("[Storyblok] MAPI failed, trying CDN fallback:", error);
    }
  }

  // Fallback to CDN API (works from EU runtime, may 401 from US build servers)
  if (cdnToken) {
    return cdnQuery(path, params, cdnToken, draft);
  }

  throw new Error("Missing both STORYBLOK_MANAGEMENT_TOKEN and STORYBLOK_API_TOKEN");
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

// Simple per-process queue to serialize MAPI requests and avoid rate limit stampedes
let mapiQueue: Promise<void> = Promise.resolve();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function mapiFetch(url: string, token: string, retries = 6): Promise<any> {
  // Wait for previous MAPI request to complete before starting a new one
  const execute = async () => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      const response = await fetch(url, {
        headers: { Authorization: token },
        cache: "no-store",
      });
      if (response.status === 429 && attempt < retries) {
        // Exponential backoff with jitter to de-synchronize parallel workers
        const base = Math.min(2000 * 2 ** attempt, 30000);
        const jitter = Math.random() * 1000;
        const wait = base + jitter;
        console.warn(`[Storyblok] MAPI 429, retry ${attempt + 1}/${retries} in ${Math.round(wait)}ms`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      if (!response.ok) {
        throw new Error(`Storyblok MAPI error: ${response.status}`);
      }
      return response.json();
    }
    throw new Error("Storyblok MAPI: max retries exceeded");
  };

  // Chain onto the queue so requests execute one at a time
  const result = mapiQueue.then(execute, execute);
  mapiQueue = result.then(() => {}, () => {});
  return result;
}

// Map content_type (component name) → Storyblok folder path for server-side filtering.
// This avoids fetching ALL stories and filtering client-side (was 11 req → now 2-N).
const CONTENT_TYPE_TO_FOLDER: Record<string, string> = {
  profile: "",          // root level, use with_slug instead
  blog_post: "blog/",
  case_study: "case-studies/",
};

async function mapiQuery(
  path: string,
  params: Record<string, string | number>,
  token: string
) {
  const base = `${STORYBLOK_MAPI}/spaces/${SPACE_ID}`;

  // List stories: cdn/stories
  if (path === "cdn/stories") {
    const contentType = params.content_type as string | undefined;
    const perPage = params.per_page ? Number(params.per_page) : 25;

    // Special case: profile is a single root-level story — 2 requests only
    if (contentType === "profile") {
      const listData = await mapiFetch(
        `${base}/stories?with_slug=profile`,
        token
      );
      if (!listData.stories?.length) {
        throw new Error("Profile story not found");
      }
      const detail = await mapiFetch(
        `${base}/stories/${listData.stories[0].id}`,
        token
      );
      return { stories: [detail.story], total: 1 };
    }

    // For known content types, scope to folder with starts_with filter
    const folder = contentType ? CONTENT_TYPE_TO_FOLDER[contentType] : undefined;
    const mapiParams = new URLSearchParams();
    if (folder) {
      mapiParams.set("starts_with", folder);
      mapiParams.set("is_startpage", "false");
    }
    mapiParams.set("per_page", String(perPage));

    // Copy through other params (sort, page, etc.) but skip content_type/per_page
    for (const [k, v] of Object.entries(params)) {
      if (k === "content_type" || k === "per_page") continue;
      mapiParams.set(k, String(v));
    }

    const listData = await mapiFetch(`${base}/stories?${mapiParams}`, token);
    const stories = listData.stories || [];

    // MAPI list doesn't include content — fetch each story individually
    const fullStories = [];
    for (const s of stories as { id: number }[]) {
      const detail = await mapiFetch(`${base}/stories/${s.id}`, token);
      fullStories.push(detail.story);
    }

    // If content_type was given but no folder mapping exists, filter client-side
    const filtered =
      contentType && !folder
        ? fullStories.filter(
            (s: { content?: { component?: string } }) =>
              s.content?.component === contentType
          )
        : fullStories;

    return { stories: filtered.slice(0, perPage), total: filtered.length };
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
