"use client";

import { useSession } from "next-auth/react";
import { Card, CardTitle, CardDescription } from "@/components/ui";

export default function AdminDashboard() {
  const { data: session } = useSession();

  return (
    <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">
        Panel de administración
      </h1>
      <p className="text-gray-500 mb-8">Visión general de la plataforma</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardTitle>Usuarios</CardTitle>
          <CardDescription>Gestión de todos los usuarios</CardDescription>
          <p className="text-3xl font-bold text-gray-800 mt-3">-</p>
        </Card>
        <Card>
          <CardTitle>Cursos</CardTitle>
          <CardDescription>Cursos creados en la plataforma</CardDescription>
          <p className="text-3xl font-bold text-gray-800 mt-3">-</p>
        </Card>
        <Card>
          <CardTitle>Certificados</CardTitle>
          <CardDescription>Certificados emitidos</CardDescription>
          <p className="text-3xl font-bold text-gray-800 mt-3">-</p>
        </Card>
      </div>
    </main>
  );
}
