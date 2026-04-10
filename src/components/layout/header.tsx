"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Logo } from "./logo";
import { Button } from "@/components/ui";
import { Avatar } from "@/components/ui";
import { useState } from "react";

export function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const dashboardUrl =
    session?.user?.role === "TEACHER"
      ? "/profesor"
      : session?.user?.role === "SUPER_ADMIN"
        ? "/admin"
        : "/alumno";

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <Logo />

          <nav className="hidden sm:flex items-center gap-4">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
                >
                  <Avatar name={session.user.name} size="sm" />
                  <span className="text-sm text-gray-700">{session.user.name}</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-1 w-48 rounded-xl border border-gray-100 bg-white py-2 shadow-lg">
                    <Link
                      href={dashboardUrl}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      Mi panel
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Ingresar</Button>
                </Link>
                <Link href="/registro">
                  <Button size="sm">Crear tu curso</Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="sm:hidden p-2 text-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="sm:hidden border-t border-gray-100 py-4 space-y-2">
            {session ? (
              <>
                <Link
                  href={dashboardUrl}
                  className="block px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  Mi panel
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="block w-full text-left px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-2 py-2 text-sm text-gray-700" onClick={() => setMenuOpen(false)}>
                  Ingresar
                </Link>
                <Link href="/registro" className="block px-2 py-2 text-sm text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>
                  Crear tu curso
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
