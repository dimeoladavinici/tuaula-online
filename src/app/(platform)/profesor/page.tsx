"use client";

import { useSession } from "next-auth/react";
import { Card, CardTitle, EmptyState, Button } from "@/components/ui";
import Link from "next/link";

export default function ProfesorDashboard() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] || "Profesor";

  return (
    <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">
        Hola, {firstName}
      </h1>
      <p className="text-gray-500 mb-8">Este es tu panel de profesor</p>

      {/* TODO: Replace with real course data */}
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

      {/* Future plan hint */}
      <div className="mt-12 rounded-xl bg-blue-50 border border-blue-100 p-4 text-center">
        <p className="text-sm text-blue-700">
          Próximamente vas a poder crear más cursos con un plan superior.
        </p>
      </div>
    </main>
  );
}
