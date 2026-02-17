const STORYBLOK_CDN = "https://api.storyblok.com/v2";
const STORYBLOK_MAPI = "https://mapi.storyblok.com/v1";
const SPACE_ID = "290596128883130";

// Use Management API (no EU redirect issues from US servers)
export async function storyblokFetch(
  path: string,
  params: Record<string, string | number> = {}
) {
  const mgmtToken = process.env.STORYBLOK_MANAGEMENT_TOKEN;
  const cdnToken = process.env.STORYBLOK_API_TOKEN;

  // Try Management API first (reliable from any region)
  if (mgmtToken) {
    return storyblokMgmtFetch(path, params, mgmtToken);
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

async function storyblokMgmtFetch(
  path: string,
  params: Record<string, string | number>,
  token: string
) {
  // Map CDN paths to Management API paths
  let mapiPath: string;
  const searchParams = new URLSearchParams();

  if (path === "cdn/stories" || path.startsWith("cdn/stories?")) {
    mapiPath = `${STORYBLOK_MAPI}/spaces/${SPACE_ID}/stories`;
    for (const [k, v] of Object.entries(params)) {
      searchParams.set(k, String(v));
    }
  } else if (path.startsWith("cdn/stories/")) {
    const slug = path.replace("cdn/stories/", "");
    mapiPath = `${STORYBLOK_MAPI}/spaces/${SPACE_ID}/stories`;
    searchParams.set("with_slug", slug);
  } else {
    mapiPath = `${STORYBLOK_MAPI}/spaces/${SPACE_ID}/${path.replace("cdn/", "")}`;
  }

  const url = `${mapiPath}?${searchParams}`;
  const response = await fetch(url, {
    headers: { Authorization: token },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Storyblok MAPI error: ${response.status}`);
  }

  const data = await response.json();

  // Normalize MAPI response to match CDN format
  if (data.story) {
    return data;
  }
  if (data.stories) {
    return { stories: data.stories, total: data.total || data.stories.length };
  }
  return data;
}
