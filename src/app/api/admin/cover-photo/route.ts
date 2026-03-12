import { NextResponse } from "next/server";
import {
  getCoverPhotoSettings,
  saveCoverPhotoSettings,
} from "@/lib/cover-photo";

export async function GET() {
  const settings = getCoverPhotoSettings();
  if (!settings) {
    return NextResponse.json(null);
  }
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const settings = await request.json();
  saveCoverPhotoSettings(settings);
  return NextResponse.json(settings);
}
