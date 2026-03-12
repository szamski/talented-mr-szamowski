"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/admin/AdminNavbar";
import SlidePreview from "@/components/admin/SlidePreview";
import SlideEditorPanel from "@/components/admin/SlideEditorPanel";
import AddSlideModal from "@/components/admin/AddSlideModal";
import ExportModal from "@/components/admin/ExportModal";

interface SlideData {
  id: string;
  html: string;
}

interface Project {
  id: string;
  name: string;
  slides: SlideData[];
  createdAt: string;
  updatedAt: string;
}

export default function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [activeSlideIdx, setActiveSlideIdx] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [status, setStatus] = useState("Loading...");
  const router = useRouter();

  useEffect(() => {
    loadProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadProject() {
    const res = await fetch(`/api/admin/projects/${id}`);
    if (!res.ok) {
      router.push("/admin");
      return;
    }
    const data = await res.json();
    setProject({ ...data, slides: renumberSlides(data.slides) });
    setLoading(false);
    setStatus(`${data.slides.length} slides loaded`);
  }

  // Update slide pagination numbers in HTML
  function renumberSlides(slides: SlideData[]): SlideData[] {
    const total = slides.length;
    return slides.map((slide, idx) => {
      const num = String(idx + 1).padStart(2, "0");
      const tot = String(total).padStart(2, "0");
      let html = slide.html;
      // Replace .sn content (slide number)
      html = html.replace(
        /(<div class="sn">)[^<]*/,
        `$1${num} / ${tot}`
      );
      return { ...slide, html };
    });
  }

  const updateSlide = useCallback(
    (slideIdx: number, newHtml: string) => {
      if (!project) return;
      const newSlides = [...project.slides];
      newSlides[slideIdx] = { ...newSlides[slideIdx], html: newHtml };
      setProject({ ...project, slides: renumberSlides(newSlides) });
      setDirty(true);
      setStatus("Unsaved changes");
    },
    [project]
  );

  const deleteSlide = useCallback(
    (slideIdx: number) => {
      if (!project || project.slides.length <= 1) return;
      if (!confirm("Delete this slide?")) return;
      const newSlides = project.slides.filter((_, i) => i !== slideIdx);
      setProject({ ...project, slides: renumberSlides(newSlides) });
      setDirty(true);
      setActiveSlideIdx(null);
      setStatus("Slide deleted - unsaved");
    },
    [project]
  );

  const moveSlide = useCallback(
    (fromIdx: number, direction: "up" | "down") => {
      if (!project) return;
      const toIdx = direction === "up" ? fromIdx - 1 : fromIdx + 1;
      if (toIdx < 0 || toIdx >= project.slides.length) return;
      const newSlides = [...project.slides];
      [newSlides[fromIdx], newSlides[toIdx]] = [
        newSlides[toIdx],
        newSlides[fromIdx],
      ];
      setProject({ ...project, slides: renumberSlides(newSlides) });
      setActiveSlideIdx(toIdx);
      setDirty(true);
    },
    [project]
  );

  const addSlide = useCallback(
    (html: string) => {
      if (!project) return;
      const newSlide: SlideData = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        html,
      };
      setProject({ ...project, slides: renumberSlides([...project.slides, newSlide]) });
      setDirty(true);
      setShowAddModal(false);
      setStatus("Slide added - unsaved");
    },
    [project]
  );

  async function saveProject() {
    if (!project || !dirty) return;
    setSaving(true);
    setStatus("Saving...");
    await fetch(`/api/admin/projects/${project.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slides: project.slides, name: project.name }),
    });
    setSaving(false);
    setDirty(false);
    setStatus("Saved");
  }

  if (loading || !project) {
    return (
      <div className="min-h-screen bg-[#050a08] flex items-center justify-center">
        <div className="text-white/30 font-mono text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050a08] flex flex-col">
      <AdminNavbar
        projectName={project.name}
        status={status}
        dirty={dirty}
        saving={saving}
        onSave={saveProject}
        onAddSlide={() => setShowAddModal(true)}
        onExport={() => setShowExportModal(true)}
      />

      {/* Content — offset for fixed navbar */}
      <div className="flex-1 flex pt-16">
        {/* Slides grid */}
        <div
          className={`flex-1 overflow-y-auto transition-all ${activeSlideIdx !== null ? "mr-[560px]" : ""}`}
        >
          <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-6 p-6">
            {project.slides.map((slide, idx) => (
              <SlidePreview
                key={slide.id}
                slide={slide}
                index={idx}
                total={project.slides.length}
                isActive={activeSlideIdx === idx}
                onEdit={() => setActiveSlideIdx(idx)}
                onDelete={() => deleteSlide(idx)}
                onMoveUp={() => moveSlide(idx, "up")}
                onMoveDown={() => moveSlide(idx, "down")}
              />
            ))}
          </div>
        </div>

        {/* Editor panel */}
        {activeSlideIdx !== null && project.slides[activeSlideIdx] && (
          <SlideEditorPanel
            slide={project.slides[activeSlideIdx]}
            slideIndex={activeSlideIdx}
            totalSlides={project.slides.length}
            onUpdate={(html) => updateSlide(activeSlideIdx, html)}
            onClose={() => setActiveSlideIdx(null)}
          />
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddSlideModal
          onAdd={addSlide}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showExportModal && (
        <ExportModal
          slides={project.slides}
          projectName={project.name}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}
