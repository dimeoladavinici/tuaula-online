import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-sm text-gray-400">
            Tu espacio simple para enseñar y aprender
          </p>
        </div>
      </div>
    </footer>
  );
}
