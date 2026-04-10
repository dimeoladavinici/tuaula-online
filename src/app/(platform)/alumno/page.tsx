"use client";

import { useSession } from "next-auth/react";
import { Card, CardTitle, CardDescription, EmptyState, Button } from "@/components/ui";
import Link from "next/link";

export default function AlumnoDashboard() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] || "Alumno";

  return (
    <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">
        Hola, {firstName}. ¿Seguimos?
      </h1>
      <p className="text-gray-500 mb-8">Este es tu panel de alumno</p>

      {/* TODO: Replace with real enrolled courses */}
      <EmptyState
        title="Todavía no estás en ningún curso"
        description="Ingresá el código que te compartió tu profesor para empezar."
        icon={
          <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        }
        action={
          <Link href="/">
            <Button>Ingresar código de curso</Button>
          </Link>
        }
      />
    </main>
  );
}
