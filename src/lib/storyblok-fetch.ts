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
  console.log("[storyblokFetch] URL:", url.replace(token, "***"));

  const response = await fetch(url, {
    redirect: "follow",
    cache: "no-store",
  });

  console.log("[storyblokFetch] Status:", response.status);

  if (!response.ok) {
    const body = await response.text();
    console.error("[storyblokFetch] Error body:", body);
    throw new Error(
      `Storyblok API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  console.log("[storyblokFetch] Success, keys:", Object.keys(data));
  return data;
}
