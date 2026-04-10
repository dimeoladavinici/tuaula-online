"use client";

import Link from "next/link";
import { Card, CardTitle, CardDescription, Button, EmptyState, ProgressBar } from "@/components/ui";

interface Props {
  course: any;
  userName: string;
}

export function ProfesorDashboardClient({ course, userName }: Props) {
  const firstName = userName?.split(" ")[0] || "Profesor";

  return (
    <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Hola, {firstName}</h1>
      <p className="text-gray-500 mb-8">Este es tu panel de profesor</p>

      {course ? (
        <div className="space-y-4">
          <Link href={`/profesor/curso/${course.slug}`}>
            <Card hover className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>{course.title}</CardTitle>
                {course.subtitle && <CardDescription>{course.subtitle}</CardDescription>}
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span>{course._count.enrollments} alumno{course._count.enrollments !== 1 ? "s" : ""}</span>
                  <span>{course.modules.length} módulo{course.modules.length !== 1 ? "s" : ""}</span>
                  <span>{course._count.certificates} certificado{course._count.certificates !== 1 ? "s" : ""}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Código de acceso</p>
                <p className="font-mono font-bold text-lg tracking-wider text-blue-600">
                  {course.accessCode}
                </p>
              </div>
            </Card>
          </Link>

          {/* Future plan hint */}
          <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-center">
            <p className="text-sm text-blue-700">
              Próximamente vas a poder crear más cursos con un plan superior.
            </p>
          </div>
        </div>
      ) : (
        <>
          <EmptyState
            title="Creá tu primer curso"
            description="Armá tu formación online en pocos pasos y empezá a enseñar."
            icon={
              <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
              </svg>
            }
            action={
              <Link href="/profesor/curso/nuevo">
                <Button>Crear curso</Button>
              </Link>
            }
          />
          <div className="mt-12 rounded-xl bg-blue-50 border border-blue-100 p-4 text-center">
            <p className="text-sm text-blue-700">
              Próximamente vas a poder crear más cursos con un plan superior.
            </p>
          </div>
        </>
      )}
    </main>
  );
}
