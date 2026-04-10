import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercent?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercent = true,
  size = "md",
  className,
}: ProgressBarProps) {
  const percent = Math.min(Math.round((value / max) * 100), 100);

  return (
    <div className={cn("w-full", className)}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm text-gray-600">{label}</span>}
          {showPercent && <span className="text-sm font-medium text-gray-700">{percent}%</span>}
        </div>
      )}
      <div className={cn("w-full rounded-full bg-gray-100 overflow-hidden", sizeStyles[size])}>
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
