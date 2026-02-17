import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  revalidatePath("/", "layout");
  revalidatePath("/blog", "layout");
  revalidatePath("/blog/archive", "layout");
  revalidatePath("/contact", "layout");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}

// Also support GET for easier testing
export async function GET(request: NextRequest) {
  return POST(request);
}
