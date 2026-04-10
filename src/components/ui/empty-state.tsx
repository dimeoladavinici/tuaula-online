import { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="mb-4 text-gray-300">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 max-w-md mb-4">{description}</p>}
      {action}
    </div>
  );
}
