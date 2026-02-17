import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.STORYBLOK_API_TOKEN;
  const results: Record<string, unknown> = {
    tokenPresent: !!token,
    tokenLength: token?.length,
    tokenPrefix: token?.substring(0, 5),
  };

  // Test direct fetch
  try {
    const url = `https://api.storyblok.com/v2/cdn/stories/profile?token=${token}&version=draft&cv=${Date.now()}`;
    const resp = await fetch(url, { redirect: "follow" });
    results.fetchStatus = resp.status;
    results.fetchOk = resp.ok;
    if (resp.ok) {
      const data = await resp.json();
      results.name = data.story?.content?.name;
    } else {
      results.fetchBody = await resp.text();
    }
  } catch (e) {
    results.fetchError = String(e);
  }

  return NextResponse.json(results);
}
