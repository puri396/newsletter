import Link from "next/link";
import type { ReactNode } from "react";

interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: EmptyStateAction;
  icon?: ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950/40 px-6 py-10 text-center">
      {icon ? (
        <div className="mb-3 text-zinc-500" aria-hidden>
          {icon}
        </div>
      ) : null}
      <h3 className="text-sm font-medium text-zinc-300">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-sm text-xs text-zinc-500">{description}</p>
      ) : null}
      {action ? (
        <div className="mt-4">
          {action.href ? (
            <Link
              href={action.href}
              className="inline-flex items-center rounded-lg bg-zinc-700 px-3 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
            >
              {action.label}
            </Link>
          ) : action.onClick ? (
            <button
              type="button"
              onClick={action.onClick}
              className="inline-flex items-center rounded-lg bg-zinc-700 px-3 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
            >
              {action.label}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
