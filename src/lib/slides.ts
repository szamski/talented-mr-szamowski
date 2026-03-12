import fs from "fs";
import path from "path";

export interface SlideProject {
  id: string;
  name: string;
  slides: SlideData[];
  createdAt: string;
  updatedAt: string;
}

export interface SlideData {
  id: string;
  html: string;
}

const DATA_DIR = path.join(process.cwd(), "data", "projects");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function listProjects(): SlideProject[] {
  ensureDir();
  const files = fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();
  return files.map((f) => {
    const data = fs.readFileSync(path.join(DATA_DIR, f), "utf-8");
    return JSON.parse(data) as SlideProject;
  });
}

export function getProject(id: string): SlideProject | null {
  ensureDir();
  const filePath = path.join(DATA_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) return null;
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data) as SlideProject;
}

export function saveProject(project: SlideProject): void {
  ensureDir();
  project.updatedAt = new Date().toISOString();
  const filePath = path.join(DATA_DIR, `${project.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(project, null, 2), "utf-8");
}

export function deleteProject(id: string): boolean {
  const filePath = path.join(DATA_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) return false;
  fs.unlinkSync(filePath);
  return true;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
