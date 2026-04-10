"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input, EmptyState } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import { createLiveClass, deleteLiveClass } from "@/actions/calendario";

interface CalendarioTabProps {
  course: any;
}

const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function CalendarioTab({ course }: CalendarioTabProps) {
  const router = useRouter();
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    dateTime: "",
    meetingUrl: "",
    isRecurring: false,
    recurrenceDay: 1,
    recurrenceTime: "19:00",
  });
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!form.title.trim() || !form.meetingUrl.trim()) return;
    if (!form.isRecurring && !form.dateTime) return;
    setLoading(true);

    const dateTime = form.isRecurring
      ? getNextOccurrence(form.recurrenceDay, form.recurrenceTime)
      : form.dateTime;

    await createLiveClass(course.id, {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      dateTime,
      meetingUrl: form.meetingUrl.trim(),
      isRecurring: form.isRecurring,
      recurrenceDay: form.isRecurring ? form.recurrenceDay : undefined,
      recurrenceTime: form.isRecurring ? form.recurrenceTime : undefined,
    });
    setForm({ title: "", description: "", dateTime: "", meetingUrl: "", isRecurring: false, recurrenceDay: 1, recurrenceTime: "19:00" });
    setShowNew(false);
    setLoading(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta clase?")) return;
    await deleteLiveClass(id);
    router.refresh();
  }

  const recurring = course.liveClasses.filter((lc: any) => lc.isRecurring);
  const oneTime = course.liveClasses.filter((lc: any) => !lc.isRecurring);
  const now = new Date();
  const upcoming = oneTime.filter((lc: any) => new Date(lc.dateTime) >= now);
  const past = oneTime.filter((lc: any) => new Date(lc.dateTime) < now);

  return (
    <div>
      {course.liveClasses.length === 0 && !showNew ? (
        <EmptyState
          title="Sin clases en vivo programadas"
          description="Agendá una clase en vivo única o configurá una clase fija semanal."
          action={<Button onClick={() => setShowNew(true)}>Programar clase en vivo</Button>}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Clases en vivo</h3>
            <Button size="sm" onClick={() => setShowNew(true)}>+ Nueva clase</Button>
          </div>

          {recurring.length > 0 && (
            <div className="space-y-2 mb-6">
              <h4 className="text-xs font-medium text-gray-500 uppercase">Clases fijas semanales</h4>
              {recurring.map((lc: any) => (
                <Card key={lc.id} className="flex items-center justify-between py-3 border-blue-100 bg-blue-50/30">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                        Semanal
                      </span>
                      <p className="font-medium text-gray-800">{lc.title}</p>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Todos los {dayNames[lc.recurrenceDay]} a las {lc.recurrenceTime}hs
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <a href={lc.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                      Link
                    </a>
                    <button onClick={() => handleDelete(lc.id)} className="text-xs text-gray-400 hover:text-red-500">
                      Eliminar
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}

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
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Nueva clase en vivo</h3>
            <div className="space-y-3">
              <Input
                id="lc-title"
                label="Título"
                placeholder="Ej: Clase de repaso"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />

              {/* Recurring toggle */}
              <label className="flex items-center gap-3 cursor-pointer rounded-lg border border-gray-200 p-3">
                <input
                  type="checkbox"
                  checked={form.isRecurring}
                  onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
                  className="rounded border-gray-300 h-4 w-4"
                />
                <div>
                  <p className="text-sm font-medium text-gray-700">Clase fija semanal</p>
                  <p className="text-xs text-gray-400">Se repite todas las semanas el mismo día y horario</p>
                </div>
              </label>

              {form.isRecurring ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Día</label>
                    <select
                      value={form.recurrenceDay}
                      onChange={(e) => setForm({ ...form, recurrenceDay: parseInt(e.target.value) })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                    >
                      {dayNames.map((day, i) => (
                        <option key={i} value={i}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Horario</label>
                    <input
                      type="time"
                      value={form.recurrenceTime}
                      onChange={(e) => setForm({ ...form, recurrenceTime: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                    />
                  </div>
                </div>
              ) : (
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
              )}

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
    <Card className={`flex items-center justify-between py-3 ${past ? "opacity-60" : ""}`}>
      <div>
        <p className="font-medium text-gray-800">{liveClass.title}</p>
        <p className="text-sm text-gray-500">{formatDateTime(new Date(liveClass.dateTime))}</p>
      </div>
      <div className="flex items-center gap-3">
        <a href={liveClass.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
          Link
        </a>
        <button onClick={() => onDelete(liveClass.id)} className="text-xs text-gray-400 hover:text-red-500">
          Eliminar
        </button>
      </div>
    </Card>
  );
}

function getNextOccurrence(day: number, time: string): string {
  const now = new Date();
  const [hours, minutes] = time.split(":").map(Number);
  const result = new Date(now);
  result.setHours(hours, minutes, 0, 0);

  const currentDay = now.getDay();
  let daysUntil = day - currentDay;
  if (daysUntil < 0) daysUntil += 7;
  if (daysUntil === 0 && result <= now) daysUntil = 7;

  result.setDate(result.getDate() + daysUntil);
  return result.toISOString();
}
