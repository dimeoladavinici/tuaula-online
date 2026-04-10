"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input, EmptyState } from "@/components/ui";
import { addContactChannel, deleteContactChannel } from "@/actions/comunidad";

interface ComunidadTabProps {
  course: any;
}

const channelTypeLabels: Record<string, string> = {
  WHATSAPP: "WhatsApp",
  EMAIL: "Email",
  TELEGRAM: "Telegram",
  INSTAGRAM: "Instagram",
  WEBSITE: "Sitio web",
  OTHER: "Otro",
};

export function ComunidadTab({ course }: ComunidadTabProps) {
  const router = useRouter();
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ type: "WHATSAPP", label: "", url: "", isPrimary: false });
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!form.label.trim() || !form.url.trim()) return;
    setLoading(true);
    await addContactChannel(course.id, {
      type: form.type as any,
      label: form.label.trim(),
      url: form.url.trim(),
      isPrimary: form.isPrimary,
    });
    setForm({ type: "WHATSAPP", label: "", url: "", isPrimary: false });
    setShowNew(false);
    setLoading(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    await deleteContactChannel(id);
    router.refresh();
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        Configurá los canales de contacto para que tus alumnos puedan comunicarse con vos o la comunidad.
      </p>

      {course.contactChannels.length === 0 && !showNew ? (
        <EmptyState
          title="Sin canales configurados"
          description="Agregá tu WhatsApp, email u otro canal para que tus alumnos te contacten."
          action={<Button onClick={() => setShowNew(true)}>Agregar canal</Button>}
        />
      ) : (
        <>
          <div className="space-y-2 mb-4">
            {course.contactChannels.map((ch: any) => (
              <Card key={ch.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">
                    {channelTypeLabels[ch.type] || ch.type}
                  </span>
                  <span className="text-sm font-medium text-gray-700">{ch.label}</span>
                  {ch.isPrimary && (
                    <span className="text-xs bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">
                      Principal
                    </span>
                  )}
                </div>
                <button onClick={() => handleDelete(ch.id)} className="text-xs text-gray-400 hover:text-red-500">
                  Quitar
                </button>
              </Card>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowNew(true)}>
            + Agregar canal
          </Button>
        </>
      )}

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <Card className="w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Nuevo canal de contacto</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                >
                  {Object.entries(channelTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <Input
                id="ch-label"
                label="Texto del botón"
                placeholder="Ej: Grupo de WhatsApp del curso"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
              <Input
                id="ch-url"
                label="Link"
                placeholder="https://chat.whatsapp.com/..."
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPrimary}
                  onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">Canal principal</span>
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" onClick={() => setShowNew(false)}>Cancelar</Button>
              <Button onClick={handleCreate} loading={loading}>Agregar</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
