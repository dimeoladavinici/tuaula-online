"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Card } from "@/components/ui";
import { createCourse } from "@/actions/curso";

export default function NuevoCursoPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", subtitle: "", description: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setError("");
    setLoading(true);

    const result = await createCourse({
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || undefined,
      description: form.description.trim() || undefined,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push(`/profesor/curso/${result.slug}`);
  }

  return (
    <main className="flex-1 mx-auto max-w-lg w-full px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Creá tu curso</h1>
      <p className="text-gray-500 mb-8">
        Empezá con lo básico. Después podés agregar módulos, clases y contenido.
      </p>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="title"
            label="Nombre del curso"
            placeholder="Ej: Inglés desde cero"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <Input
            id="subtitle"
            label="Subtítulo (opcional)"
            placeholder="Una frase corta sobre el curso"
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          />
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción (opcional)
            </label>
            <textarea
              id="description"
              rows={4}
              placeholder="Contá de qué se trata tu curso"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-800 placeholder-gray-400 transition-colors focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full" loading={loading}>
            Crear curso
          </Button>
        </form>
      </Card>
    </main>
  );
}
