import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  // Clear the unstable_cache entries tagged "storyblok"
  revalidateTag("storyblok", "default");

  revalidatePath("/", "layout");
  revalidatePath("/blog", "layout");
  revalidatePath("/blog/archive", "layout");
  revalidatePath("/case-studies", "layout");
  revalidatePath("/contact", "layout");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}

// Also support GET for easier testing
export async function GET(request: NextRequest) {
  return POST(request);
}
