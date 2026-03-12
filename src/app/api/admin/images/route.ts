import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const IMAGES_DIR = path.join(process.cwd(), "data", "images");

function ensureDir() {
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }
}

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

export async function GET(request: Request) {
  ensureDir();
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  // Serve individual image
  if (name) {
    const filePath = path.join(IMAGES_DIR, name);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const buffer = fs.readFileSync(filePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  // List all images
  const files = fs
    .readdirSync(IMAGES_DIR)
    .filter((f) => /\.(png|jpg|jpeg|webp|avif|gif|svg)$/i.test(f))
    .sort();

  const images = files.map((f) => ({
    name: f,
    url: `/api/admin/images?name=${encodeURIComponent(f)}`,
  }));

  return NextResponse.json(images);
}

export async function POST(request: Request) {
  ensureDir();
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = path.join(IMAGES_DIR, safeName);

  fs.writeFileSync(filePath, buffer);

  return NextResponse.json({
    name: safeName,
    url: `/api/admin/images?name=${encodeURIComponent(safeName)}`,
  });
}

export async function DELETE(request: Request) {
  ensureDir();
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const filePath = path.join(IMAGES_DIR, name);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  fs.unlinkSync(filePath);
  return NextResponse.json({ ok: true });
}
