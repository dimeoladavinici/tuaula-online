"use client";

import { Tabs } from "@/components/ui";
import { ContenidoTab } from "./tabs/contenido-tab";
import { CalendarioTab } from "./tabs/calendario-tab";
import { ComunidadTab } from "./tabs/comunidad-tab";
import { ConfigTab } from "./tabs/config-tab";

interface CursoManagerProps {
  course: any; // Full course with all relations from getCourseBySlug
}

const tabs = [
  { id: "contenido", label: "Contenido" },
  { id: "calendario", label: "Calendario" },
  { id: "comunidad", label: "Comunidad" },
  { id: "config", label: "Configuración" },
];

export function CursoManager({ course }: CursoManagerProps) {
  return (
    <Tabs tabs={tabs} defaultTab="contenido">
      {(activeTab) => (
        <>
          {activeTab === "contenido" && <ContenidoTab course={course} />}
          {activeTab === "calendario" && <CalendarioTab course={course} />}
          {activeTab === "comunidad" && <ComunidadTab course={course} />}
          {activeTab === "config" && <ConfigTab course={course} />}
        </>
      )}
    </Tabs>
  );
}
