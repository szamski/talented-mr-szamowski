import fs from "fs";
import path from "path";

export interface CoverPhotoSettings {
  eyebrow: string;
  headlinePre: string;
  headlineHighlight: string;
  headlinePost: string;
  description: string;
  tags: string[];
  textScale: number;
  textX: number;
  textY: number;
  tagsX: number;
  showDotMatrix: boolean;
  showOrbs: boolean;
  bgOpacity: number;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "cover-photo.json");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getCoverPhotoSettings(): CoverPhotoSettings | null {
  ensureDir();
  if (!fs.existsSync(FILE_PATH)) return null;
  const data = fs.readFileSync(FILE_PATH, "utf-8");
  return JSON.parse(data) as CoverPhotoSettings;
}

export function saveCoverPhotoSettings(settings: CoverPhotoSettings): void {
  ensureDir();
  settings.updatedAt = new Date().toISOString();
  fs.writeFileSync(FILE_PATH, JSON.stringify(settings, null, 2), "utf-8");
}
