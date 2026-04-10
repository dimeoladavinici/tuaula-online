"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input } from "@/components/ui";
import { updateCourse } from "@/actions/curso";

interface ConfigTabProps {
  course: any;
}

export function ConfigTab({ course }: ConfigTabProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: course.title || "",
    subtitle: course.subtitle || "",
    description: course.description || "",
    minProgressForCert: course.minProgressForCert || 85,
    published: course.published || false,
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setLoading(true);
    setSaved(false);
    await updateCourse(course.id, {
      title: form.title,
      subtitle: form.subtitle || undefined,
      description: form.description || undefined,
      minProgressForCert: form.minProgressForCert,
      published: form.published,
    });
    setLoading(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6 max-w-lg">
      <Card>
        <h3 className="font-semibold text-gray-800 mb-4">Datos del curso</h3>
        <div className="space-y-3">
          <Input
            id="cfg-title"
            label="Nombre"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Input
            id="cfg-subtitle"
            label="Subtítulo"
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          />
          <div>
            <label htmlFor="cfg-desc" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              id="cfg-desc"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm resize-none focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-gray-800 mb-4">Certificado</h3>
        <div>
          <label htmlFor="cfg-cert" className="block text-sm font-medium text-gray-700 mb-1">
            Progreso mínimo para habilitar certificado
          </label>
          <div className="flex items-center gap-2">
            <input
              id="cfg-cert"
              type="range"
              min={50}
              max={100}
              step={5}
              value={form.minProgressForCert}
              onChange={(e) => setForm({ ...form, minProgressForCert: parseInt(e.target.value) })}
              className="flex-1"
            />
            <span className="text-sm font-medium text-gray-700 w-12 text-right">
              {form.minProgressForCert}%
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            El alumno necesita completar este porcentaje de clases + aprobar el examen final.
          </p>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-gray-800 mb-4">Publicación</h3>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
            className="rounded border-gray-300 h-5 w-5"
          />
          <div>
            <p className="text-sm font-medium text-gray-700">Curso publicado</p>
            <p className="text-xs text-gray-400">
              Los alumnos solo pueden unirse si el curso está publicado.
            </p>
          </div>
        </label>
      </Card>

      <Card className="bg-gray-50/50">
        <h3 className="font-semibold text-gray-800 mb-2">Compartir curso</h3>
        <p className="text-sm text-gray-500 mb-3">Compartí este código o link con tus alumnos:</p>
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono font-bold text-xl tracking-wider text-blue-600">
            {course.accessCode}
          </span>
        </div>
        <p className="text-xs text-gray-400">
          Link directo: tuaula.online/unirse/{course.accessCode}
        </p>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} loading={loading}>Guardar cambios</Button>
        {saved && <span className="text-sm text-emerald-600">Guardado</span>}
      </div>
    </div>
  );
}
