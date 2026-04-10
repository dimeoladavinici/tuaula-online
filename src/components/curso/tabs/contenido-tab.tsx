"use client";

import { useState } from "react";
import { Button, Card, Input, EmptyState } from "@/components/ui";
import { createModule } from "@/actions/modulos";
import { createLesson, addVideo, addResource, deleteVideo, deleteResource, deleteLesson } from "@/actions/clases";
import { deleteModule } from "@/actions/modulos";
import { useRouter } from "next/navigation";

interface ContenidoTabProps {
  course: any;
}

export function ContenidoTab({ course }: ContenidoTabProps) {
  const router = useRouter();
  const [showNewModule, setShowNewModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreateModule() {
    if (!newModuleTitle.trim()) return;
    setLoading(true);
    await createModule(course.id, { title: newModuleTitle.trim() });
    setNewModuleTitle("");
    setShowNewModule(false);
    setLoading(false);
    router.refresh();
  }

  return (
    <div>
      {course.modules.length === 0 ? (
        <EmptyState
          title="Todavía no hay módulos"
          description="Creá tu primer módulo para empezar a armar el contenido del curso."
          action={
            <Button onClick={() => setShowNewModule(true)}>Agregar módulo</Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {course.modules.map((module: any, idx: number) => (
            <ModuleCard key={module.id} module={module} courseId={course.id} index={idx} />
          ))}
          <Button variant="outline" onClick={() => setShowNewModule(true)}>
            + Agregar módulo
          </Button>
        </div>
      )}

      {showNewModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <Card className="w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Nuevo módulo</h3>
            <Input
              id="module-title"
              label="Nombre del módulo"
              placeholder="Ej: Módulo 1 - Introducción"
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" onClick={() => { setShowNewModule(false); setNewModuleTitle(""); }}>
                Cancelar
              </Button>
              <Button onClick={handleCreateModule} loading={loading} disabled={!newModuleTitle.trim()}>
                Crear módulo
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function ModuleCard({ module, courseId, index }: { module: any; courseId: string; index: number }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(true);
  const [showNewLesson, setShowNewLesson] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleCreateLesson() {
    if (!newLessonTitle.trim()) return;
    setLoading(true);
    await createLesson(module.id, { title: newLessonTitle.trim() });
    setNewLessonTitle("");
    setShowNewLesson(false);
    setLoading(false);
    router.refresh();
  }

  async function handleDeleteModule() {
    if (!confirm("¿Seguro querés eliminar este módulo y todas sus clases?")) return;
    setDeleting(true);
    await deleteModule(module.id);
    router.refresh();
  }

  return (
    <Card className="p-0 overflow-hidden">
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-400">Módulo {index + 1}</span>
          <h3 className="font-semibold text-gray-800">{module.title}</h3>
          <span className="text-xs text-gray-400">
            {module.lessons.length} {module.lessons.length === 1 ? "clase" : "clases"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteModule(); }}
            className="text-gray-400 hover:text-red-500 text-sm p-1"
            disabled={deleting}
          >
            {deleting ? "..." : "Eliminar"}
          </button>
          <svg
            className={`h-5 w-5 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4">
          {module.lessons.length === 0 ? (
            <p className="text-sm text-gray-400 mb-3">Todavía no hay clases en este módulo.</p>
          ) : (
            <div className="space-y-2 mb-3">
              {module.lessons.map((lesson: any, idx: number) => (
                <LessonRow key={lesson.id} lesson={lesson} index={idx} />
              ))}
            </div>
          )}

          {showNewLesson ? (
            <div className="flex items-end gap-2">
              <Input
                id={`lesson-${module.id}`}
                placeholder="Nombre de la clase"
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                className="text-sm"
                autoFocus
              />
              <Button size="sm" onClick={handleCreateLesson} loading={loading} disabled={!newLessonTitle.trim()}>
                Crear
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setShowNewLesson(false); setNewLessonTitle(""); }}>
                Cancelar
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewLesson(true)}
              className="text-sm text-blue-500 hover:text-blue-600 font-medium"
            >
              + Agregar clase
            </button>
          )}
        </div>
      )}
    </Card>
  );
}

function LessonRow({ lesson, index }: { lesson: any; index: number }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [showAddResource, setShowAddResource] = useState(false);
  const [videoForm, setVideoForm] = useState({ title: "", type: "LOOM_EMBED" as const, url: "" });
  const [resourceForm, setResourceForm] = useState({ title: "", url: "", resourceType: "OTHER" as const });
  const [loading, setLoading] = useState(false);

  async function handleAddVideo() {
    if (!videoForm.title.trim() || !videoForm.url.trim()) return;
    setLoading(true);
    await addVideo(lesson.id, {
      title: videoForm.title.trim(),
      type: videoForm.type,
      url: videoForm.url.trim(),
    });
    setVideoForm({ title: "", type: "LOOM_EMBED", url: "" });
    setShowAddVideo(false);
    setLoading(false);
    router.refresh();
  }

  async function handleAddResource() {
    if (!resourceForm.title.trim() || !resourceForm.url.trim()) return;
    setLoading(true);
    await addResource(lesson.id, {
      title: resourceForm.title.trim(),
      url: resourceForm.url.trim(),
      resourceType: resourceForm.resourceType,
    });
    setResourceForm({ title: "", url: "", resourceType: "OTHER" });
    setShowAddResource(false);
    setLoading(false);
    router.refresh();
  }

  async function handleDeleteVideo(videoId: string) {
    await deleteVideo(videoId);
    router.refresh();
  }

  async function handleDeleteResource(resourceId: string) {
    await deleteResource(resourceId);
    router.refresh();
  }

  async function handleDeleteLesson() {
    if (!confirm("¿Seguro querés eliminar esta clase?")) return;
    await deleteLesson(lesson.id);
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50/50">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-mono">{index + 1}</span>
          <span className="text-sm font-medium text-gray-700">{lesson.title}</span>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            {lesson.videos.length > 0 && <span>{lesson.videos.length} video{lesson.videos.length !== 1 ? "s" : ""}</span>}
            {lesson.resources.length > 0 && <span>· {lesson.resources.length} recurso{lesson.resources.length !== 1 ? "s" : ""}</span>}
            {lesson.quiz && <span>· Evaluación</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteLesson(); }}
            className="text-xs text-gray-400 hover:text-red-500 p-1"
          >
            Eliminar
          </button>
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-4">
          {/* Videos */}
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Videos</h4>
            {lesson.videos.length > 0 && (
              <div className="space-y-1 mb-2">
                {lesson.videos.map((video: any) => (
                  <div key={video.id} className="flex items-center justify-between text-sm bg-white rounded px-3 py-2 border border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-mono">
                        {video.type === "GOOGLE_DRIVE" ? "Drive" : video.type === "LOOM_LINK" ? "Loom" : "Embed"}
                      </span>
                      <span className="text-gray-700">{video.title}</span>
                    </div>
                    <button onClick={() => handleDeleteVideo(video.id)} className="text-xs text-gray-400 hover:text-red-500">
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            )}
            {showAddVideo ? (
              <div className="space-y-2 bg-white rounded-lg border border-gray-100 p-3">
                <Input
                  id={`video-title-${lesson.id}`}
                  placeholder="Título del video"
                  value={videoForm.title}
                  onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  className="text-sm"
                />
                <select
                  value={videoForm.type}
                  onChange={(e) => setVideoForm({ ...videoForm, type: e.target.value as any })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="LOOM_EMBED">Loom (embed)</option>
                  <option value="LOOM_LINK">Loom (link)</option>
                  <option value="GOOGLE_DRIVE">Google Drive</option>
                </select>
                <Input
                  id={`video-url-${lesson.id}`}
                  placeholder="URL del video"
                  value={videoForm.url}
                  onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddVideo} loading={loading}>Agregar</Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowAddVideo(false)}>Cancelar</Button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAddVideo(true)} className="text-xs text-blue-500 hover:text-blue-600 font-medium">
                + Agregar video
              </button>
            )}
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Recursos</h4>
            {lesson.resources.length > 0 && (
              <div className="space-y-1 mb-2">
                {lesson.resources.map((resource: any) => (
                  <div key={resource.id} className="flex items-center justify-between text-sm bg-white rounded px-3 py-2 border border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">
                        {resource.resourceType}
                      </span>
                      <span className="text-gray-700">{resource.title}</span>
                    </div>
                    <button onClick={() => handleDeleteResource(resource.id)} className="text-xs text-gray-400 hover:text-red-500">
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            )}
            {showAddResource ? (
              <div className="space-y-2 bg-white rounded-lg border border-gray-100 p-3">
                <Input
                  id={`resource-title-${lesson.id}`}
                  placeholder="Título del recurso"
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                  className="text-sm"
                />
                <select
                  value={resourceForm.resourceType}
                  onChange={(e) => setResourceForm({ ...resourceForm, resourceType: e.target.value as any })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="PDF">PDF</option>
                  <option value="DOCUMENT">Documento</option>
                  <option value="GUIDE">Guía</option>
                  <option value="TEMPLATE">Plantilla</option>
                  <option value="OTHER">Otro</option>
                </select>
                <Input
                  id={`resource-url-${lesson.id}`}
                  placeholder="URL del recurso"
                  value={resourceForm.url}
                  onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddResource} loading={loading}>Agregar</Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowAddResource(false)}>Cancelar</Button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAddResource(true)} className="text-xs text-blue-500 hover:text-blue-600 font-medium">
                + Agregar recurso
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
