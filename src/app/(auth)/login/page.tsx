"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/layout";
import { Button, Input } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email o contraseña incorrectos");
      return;
    }

    // Fetch session to get role for redirect
    const res = await fetch("/api/auth/session");
    const session = await res.json();
    const role = session?.user?.role;

    if (callbackUrl) {
      router.push(callbackUrl);
    } else if (role === "TEACHER") {
      router.push("/profesor");
    } else if (role === "SUPER_ADMIN") {
      router.push("/admin");
    } else {
      router.push("/alumno");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBF8F4] px-4">
      <div className="mb-8">
        <Logo size="lg" />
      </div>
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <h1 className="text-xl font-semibold text-gray-800 text-center mb-6">
          Ingresá a tu cuenta
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="password"
            label="Contraseña"
            type="password"
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <Button type="submit" className="w-full" loading={loading}>
            Ingresar
          </Button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
          ¿No tenés cuenta?{" "}
          <Link href="/registro" className="text-blue-500 hover:underline">
            Registrate
          </Link>
        </p>
      </div>
    </div>
  );
}
