"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Logo } from "@/components/layout";
import { Button, Card, CardTitle } from "@/components/ui";
import Link from "next/link";

export default function UnirseCursoPage() {
  const { code } = useParams<{ code: string }>();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF8F4]">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBF8F4] px-4">
      <div className="mb-8">
        <Logo size="lg" />
      </div>
      <Card className="max-w-sm w-full text-center">
        <CardTitle>Unirte a un curso</CardTitle>
        <p className="text-gray-500 mt-2 mb-4">
          Código: <span className="font-mono font-bold tracking-wider">{code}</span>
        </p>

        {session ? (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Vas a unirte como <strong>{session.user.name}</strong>
            </p>
            {/* TODO: Implement actual join logic */}
            <Button className="w-full">
              Unirme al curso
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Necesitás una cuenta para unirte a este curso.
            </p>
            <div className="space-y-2">
              <Link href={`/registro?callbackUrl=/unirse/${code}`} className="block">
                <Button className="w-full">Crear cuenta</Button>
              </Link>
              <Link href={`/login?callbackUrl=/unirse/${code}`} className="block">
                <Button variant="outline" className="w-full">Ya tengo cuenta</Button>
              </Link>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
