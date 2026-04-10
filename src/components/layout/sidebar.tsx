"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  links: SidebarLink[];
}

export function Sidebar({ links }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-gray-100 bg-white min-h-[calc(100vh-4rem)]">
      <nav className="flex flex-col gap-1 p-4">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
              )}
            >
              <span className="flex-shrink-0">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
