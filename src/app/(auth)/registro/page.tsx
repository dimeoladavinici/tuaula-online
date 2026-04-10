"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/layout";
import { Button, Input } from "@/components/ui";

type SelectedRole = "STUDENT" | "TEACHER" | null;

export default function RegistroPage() {
  const router = useRouter();
  const [step, setStep] = useState<"role" | "form">("role");
  const [selectedRole, setSelectedRole] = useState<SelectedRole>(null);
  const [form, setForm] = useState({ name: "", lastName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function selectRole(role: SelectedRole) {
    setSelectedRole(role);
    setStep("form");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, role: selectedRole }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    // Auto-login after registration
    const loginResult = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (loginResult?.error) {
      setError("Cuenta creada, pero hubo un error al iniciar sesión. Intentá ingresar.");
      return;
    }

    router.push(selectedRole === "TEACHER" ? "/profesor" : "/alumno");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBF8F4] px-4">
      <div className="mb-8">
        <Logo size="lg" />
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        {step === "role" ? (
          <>
            <h1 className="text-xl font-semibold text-gray-800 text-center mb-2">
              Creá tu cuenta
            </h1>
            <p className="text-sm text-gray-500 text-center mb-6">
              ¿Qué querés hacer?
            </p>
            <div className="space-y-3">
              <button
                onClick={() => selectRole("TEACHER")}
                className="w-full rounded-xl border-2 border-gray-200 p-4 text-left hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <p className="font-medium text-gray-800">Quiero enseñar</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Creá tu curso y compartilo con tus alumnos
                </p>
              </button>
              <button
                onClick={() => selectRole("STUDENT")}
                className="w-full rounded-xl border-2 border-gray-200 p-4 text-left hover:border-emerald-400 hover:bg-emerald-50 transition-colors"
              >
                <p className="font-medium text-gray-800">Quiero aprender</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Accedé al curso que te compartieron
                </p>
              </button>
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => setStep("role")}
              className="text-sm text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </button>
            <h1 className="text-xl font-semibold text-gray-800 text-center mb-6">
              {selectedRole === "TEACHER" ? "Registro de profesor" : "Registro de alumno"}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="name"
                label="Nombre"
                placeholder="Tu nombre"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Input
                id="lastName"
                label="Apellido"
                placeholder="Tu apellido"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                required
              />
              <Input
                id="email"
                label="Email"
                type="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <Input
                id="password"
                label="Contraseña"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              <Button type="submit" className="w-full" loading={loading}>
                Crear cuenta
              </Button>
            </form>
          </>
        )}

        <p className="text-sm text-gray-500 text-center mt-6">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-blue-500 hover:underline">
            Ingresá
          </Link>
        </p>
      </div>
    </div>
  );
}
