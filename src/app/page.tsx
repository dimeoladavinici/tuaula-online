"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout";
import { Footer } from "@/components/layout";
import { Button, Input } from "@/components/ui";

export default function Home() {
  const [code, setCode] = useState("");
  const router = useRouter();

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim()) {
      router.push(`/unirse/${code.trim().toUpperCase()}`);
    }
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 leading-tight mb-4">
              Tu espacio simple para{" "}
              <span className="text-blue-500">enseñar</span> y{" "}
              <span className="text-blue-500">aprender</span>
            </h1>
            <p className="text-lg text-gray-500 mb-10">
              Creá tu curso online en minutos. Tus alumnos aprenden, se evalúan
              y obtienen su certificado.
            </p>

            {/* Join by code */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm max-w-md mx-auto">
              <p className="text-sm font-medium text-gray-600 mb-3">
                ¿Tenés un código de curso?
              </p>
              <form onSubmit={handleJoin} className="flex gap-2">
                <Input
                  placeholder="Ej: ABC123"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="text-center tracking-widest uppercase font-mono"
                />
                <Button type="submit" disabled={!code.trim()}>
                  Ingresar
                </Button>
              </form>
            </div>
          </div>
        </section>

        {/* Value blocks */}
        <section className="bg-white border-t border-gray-100 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <ValueBlock
                icon={
                  <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                }
                title="Creá tu curso"
                description="Organizá módulos, clases, videos y evaluaciones de forma simple."
              />
              <ValueBlock
                icon={
                  <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
                title="Invitá a tus alumnos"
                description="Compartí un código o link y listo. Sin complicaciones."
              />
              <ValueBlock
                icon={
                  <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
                title="Seguí su avance"
                description="Sabé exactamente cómo va cada alumno con métricas claras."
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function ValueBlock({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-3">{icon}</div>
      <h3 className="text-base font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}
