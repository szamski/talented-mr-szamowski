import { NextResponse } from "next/server";
import {
  listProjects,
  saveProject,
  generateId,
  type SlideProject,
} from "@/lib/slides";
import { SLIDE_TEMPLATES } from "@/lib/slide-templates";

export async function GET() {
  const projects = listProjects();
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const { name } = await request.json();

  const project: SlideProject = {
    id: generateId(),
    name: name || "New Project",
    slides: [
      {
        id: generateId(),
        html: SLIDE_TEMPLATES.cover,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveProject(project);
  return NextResponse.json(project, { status: 201 });
}
