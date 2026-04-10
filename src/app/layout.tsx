import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Tu Aula Online — Tu espacio simple para enseñar y aprender",
  description:
    "Creá tu curso online de manera simple. Tus alumnos aprenden, se evalúan y obtienen su certificado.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#FBF8F4] text-gray-800">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
