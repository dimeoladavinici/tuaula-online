import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
};

export function Logo({ className, size = "md" }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 font-bold", sizeStyles[size], className)}>
      <span className="text-blue-500">Tu Aula</span>
      <span className="text-gray-700">Online</span>
    </Link>
  );
}
