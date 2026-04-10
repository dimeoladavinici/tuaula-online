"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input, EmptyState } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import { createLiveClass, deleteLiveClass } from "@/actions/calendario";

interface CalendarioTabProps {
  course: any;
}

export function CalendarioTab({ course }: CalendarioTabProps) {
  const router = useRouter();
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", dateTime: "", meetingUrl: "" });
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!form.title.trim() || !form.dateTime || !form.meetingUrl.trim()) return;
    setLoading(true);
    await createLiveClass(course.id, {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      dateTime: form.dateTime,
      meetingUrl: form.meetingUrl.trim(),
    });
    setForm({ title: "", description: "", dateTime: "", meetingUrl: "" });
    setShowNew(false);
    setLoading(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta clase en vivo?")) return;
    await deleteLiveClass(id);
    router.refresh();
  }

  const now = new Date();
  const upcoming = course.liveClasses.filter((lc: any) => new Date(lc.dateTime) >= now);
  const past = course.liveClasses.filter((lc: any) => new Date(lc.dateTime) < now);

  return (
    <div>
      {course.liveClasses.length === 0 && !showNew ? (
        <EmptyState
          title="Sin clases en vivo programadas"
          description="Agendá una clase en vivo para que tus alumnos puedan conectarse."
          action={<Button onClick={() => setShowNew(true)}>Programar clase en vivo</Button>}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Clases en vivo</h3>
            <Button size="sm" onClick={() => setShowNew(true)}>+ Nueva clase</Button>
          </div>

          {upcoming.length > 0 && (
            <div className="space-y-2 mb-6">
              <h4 className="text-xs font-medium text-gray-500 uppercase">Próximas</h4>
              {upcoming.map((lc: any) => (
                <LiveClassCard key={lc.id} liveClass={lc} onDelete={handleDelete} />
              ))}
            </div>
          )}

          {past.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-500 uppercase">Pasadas</h4>
              {past.map((lc: any) => (
                <LiveClassCard key={lc.id} liveClass={lc} onDelete={handleDelete} past />
              ))}
            </div>
          )}
        </>
      )}

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <Card className="w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Nueva clase en vivo</h3>
            <div className="space-y-3">
              <Input
                id="lc-title"
                label="Título"
                placeholder="Ej: Clase de repaso - Módulo 1"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <div>
                <label htmlFor="lc-datetime" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha y hora
                </label>
                <input
                  id="lc-datetime"
                  type="datetime-local"
                  value={form.dateTime}
                  onChange={(e) => setForm({ ...form, dateTime: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                />
              </div>
              <Input
                id="lc-url"
                label="Link de la reunión"
                placeholder="https://meet.google.com/... o zoom link"
                value={form.meetingUrl}
                onChange={(e) => setForm({ ...form, meetingUrl: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" onClick={() => setShowNew(false)}>Cancelar</Button>
              <Button onClick={handleCreate} loading={loading}>Programar</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function LiveClassCard({ liveClass, onDelete, past }: { liveClass: any; onDelete: (id: string) => void; past?: boolean }) {
  return (
    <Card className={`flex items-center justify-between ${past ? "opacity-60" : ""}`}>
      <div>
        <p className="font-medium text-gray-800">{liveClass.title}</p>
        <p className="text-sm text-gray-500">{formatDateTime(new Date(liveClass.dateTime))}</p>
      </div>
      <div className="flex items-center gap-2">
        <a
          href={liveClass.meetingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-500 hover:underline"
        >
          Link
        </a>
        <button onClick={() => onDelete(liveClass.id)} className="text-xs text-gray-400 hover:text-red-500">
          Eliminar
        </button>
      </div>
    </Card>
  );
}
