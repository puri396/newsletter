interface MetricCardProps {
  label: string;
  value: number;
  description?: string;
}

export function MetricCard({ label, value, description }: MetricCardProps) {
  return (
    <section className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 shadow-sm">
      <p className="text-xs font-medium text-zinc-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">
        {value}
      </p>
      {description ? (
        <p className="mt-1 text-[11px] text-zinc-500">{description}</p>
      ) : null}
    </section>
  );
}

