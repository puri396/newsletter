import type { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  value: ReactNode;
  description?: string;
  icon?: ReactNode;
  className?: string;
}

export function DashboardCard({
  title,
  value,
  description,
  icon,
  className = "",
}: DashboardCardProps) {
  return (
    <section
      className={`flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 shadow-sm ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-zinc-400">{title}</p>
        {icon ? <span className="text-zinc-500">{icon}</span> : null}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">
        {value}
      </p>
      {description ? (
        <p className="mt-1 text-[11px] text-zinc-500">{description}</p>
      ) : null}
    </section>
  );
}
