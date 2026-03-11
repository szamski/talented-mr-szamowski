import { createHmac } from "crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * Verify Storyblok webhook signature (HMAC-SHA1 of the raw body).
 * Falls back to ?secret= query param for manual/test triggers.
 */
async function isAuthorized(request: NextRequest, rawBody: string): Promise<boolean> {
  // 1. Check Storyblok webhook-signature header (HMAC-SHA1)
  const signature = request.headers.get("webhook-signature");
  const webhookSecret = process.env.REVALIDATION_SECRET;

  if (!webhookSecret) return false;

  if (signature) {
    const expected = createHmac("sha1", webhookSecret)
      .update(rawBody)
      .digest("hex");
    return signature === expected;
  }

  // 2. Fallback: query param for manual/test triggers
  const querySecret = request.nextUrl.searchParams.get("secret");
  return querySecret === webhookSecret;
}

/** Map Storyblok full_slug to a revalidation path */
function slugToPath(fullSlug: string | undefined): string | null {
  if (!fullSlug) return null;
  const slug = fullSlug.replace(/^\/+|\/+$/g, "");
  if (slug === "" || slug === "profile") return "/";
  return `/${slug}`;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  if (!(await isAuthorized(request, rawBody))) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  // Parse Storyblok webhook payload (best-effort)
  let payload: { action?: string; full_slug?: string; story_id?: number } = {};
  try {
    payload = JSON.parse(rawBody);
  } catch {
    // Empty body is fine for manual GET/test triggers
  }

  // Invalidate all storyblok-tagged cache entries (expire: 0 = immediate)
  revalidateTag("storyblok", { expire: 0 });

  // Targeted path revalidation if we know which story changed
  const targetPath = slugToPath(payload.full_slug);
  if (targetPath) {
    revalidatePath(targetPath, "layout");
  }

  // Always revalidate the home page (profile data appears there)
  revalidatePath("/", "layout");

  console.log(
    `[Revalidate] action=${payload.action ?? "manual"} slug=${payload.full_slug ?? "n/a"} path=${targetPath ?? "/"}`
  );

  return NextResponse.json({
    revalidated: true,
    action: payload.action,
    slug: payload.full_slug,
    now: Date.now(),
  });
}

// GET for manual testing: /api/revalidate?secret=...
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  revalidateTag("storyblok", { expire: 0 });
  revalidatePath("/", "layout");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
