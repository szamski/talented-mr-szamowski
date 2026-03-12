"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/admin/AdminNavbar";

interface Project {
  id: string;
  name: string;
  slides: { id: string; html: string }[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    const res = await fetch("/api/admin/projects");
    const data = await res.json();
    setProjects(data);
    setLoading(false);
  }

  async function createProject() {
    if (!newName.trim()) return;
    setCreating(true);
    const res = await fetch("/api/admin/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const project = await res.json();
    setNewName("");
    setCreating(false);
    router.push(`/admin/editor/${project.id}`);
  }

  async function deleteProject(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="min-h-screen bg-[#050a08]">
      <AdminNavbar />

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-12">
        {/* Create new */}
        <div className="glass rounded-2xl p-6 border border-white/5 mb-8">
          <h2 className="text-sm font-mono text-brand/70 uppercase tracking-wider mb-4">
            New Project
          </h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createProject()}
              placeholder="Project name (e.g. Copa City Carousel)"
              className="flex-1 bg-[#080818] border border-white/10 rounded-lg px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-brand/50 transition-colors placeholder:text-white/20"
            />
            <button
              onClick={createProject}
              disabled={creating || !newName.trim()}
              className="bg-brand text-[#050a08] font-bold px-6 py-3 rounded-lg text-sm font-mono hover:brightness-110 transition-all disabled:opacity-40"
            >
              {creating ? "Creating..." : "Create"}
            </button>
          </div>
        </div>

        {/* Projects list */}
        <h2 className="text-sm font-mono text-brand/70 uppercase tracking-wider mb-4">
          Projects
        </h2>

        {loading ? (
          <div className="text-white/30 font-mono text-sm text-center py-12">
            Loading...
          </div>
        ) : projects.length === 0 ? (
          <div className="text-white/20 font-mono text-sm text-center py-12 glass rounded-2xl border border-white/5">
            No projects yet. Create one above.
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="glass rounded-xl border border-white/5 hover:border-brand/30 transition-colors p-5 flex items-center gap-4 cursor-pointer group"
                onClick={() => router.push(`/admin/editor/${project.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm truncate group-hover:text-brand transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-white/30 font-mono text-xs mt-1">
                    {project.slides.length} slide
                    {project.slides.length !== 1 ? "s" : ""} &middot; Updated{" "}
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProject(project.id, project.name);
                  }}
                  className="text-white/20 hover:text-red-400 text-xs font-mono transition-colors px-3 py-1"
                >
                  Delete
                </button>
                <span className="text-brand/40 text-xs font-mono group-hover:text-brand transition-colors">
                  Open &rarr;
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
