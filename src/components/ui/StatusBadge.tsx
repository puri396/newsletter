interface StatusBadgeProps {
  status: string;
}

const base =
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset";

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toLowerCase();
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  if (normalized === "draft")
    return (
      <span
        className={`${base} bg-zinc-900/60 text-zinc-300 ring-zinc-700`}
      >
        Draft
      </span>
    );
  if (normalized === "scheduled")
    return (
      <span
        className={`${base} bg-amber-900/40 text-amber-300 ring-amber-700`}
      >
        Scheduled
      </span>
    );
  if (normalized === "published")
    return (
      <span
        className={`${base} bg-emerald-900/40 text-emerald-300 ring-emerald-700`}
      >
        Published
      </span>
    );
  if (normalized === "pending")
    return (
      <span
        className={`${base} bg-amber-900/40 text-amber-300 ring-amber-700`}
      >
        Pending
      </span>
    );
  if (normalized === "active")
    return (
      <span
        className={`${base} bg-emerald-900/40 text-emerald-300 ring-emerald-700`}
      >
        Active
      </span>
    );
  if (normalized === "unsubscribed")
    return (
      <span
        className={`${base} bg-zinc-900/60 text-zinc-400 ring-zinc-700`}
      >
        Unsubscribed
      </span>
    );
  if (normalized === "archived")
    return (
      <span
        className={`${base} bg-zinc-800/60 text-zinc-500 ring-zinc-600`}
      >
        Archived
      </span>
    );
  if (normalized === "sent" || normalized === "failed")
    return (
      <span
        className={`${base} bg-zinc-900/60 text-zinc-300 ring-zinc-700`}
      >
        {label}
      </span>
    );

  return (
    <span className={`${base} bg-zinc-900/60 text-zinc-300 ring-zinc-700`}>
      {label}
    </span>
  );
}

interface ContentTypeBadgeProps {
  type: string;
}

export function ContentTypeBadge({ type }: ContentTypeBadgeProps) {
  const normalized = type.toLowerCase();
  const label = type.charAt(0).toUpperCase() + type.slice(1);

  if (normalized === "newsletter") {
    return (
      <span
        className={`${base} bg-blue-900/40 text-blue-300 ring-blue-700`}
      >
        {label}
      </span>
    );
  }

  if (normalized === "blog") {
    return (
      <span
        className={`${base} bg-purple-900/40 text-purple-300 ring-purple-700`}
      >
        {label}
      </span>
    );
  }

  if (normalized === "image") {
    return (
      <span
        className={`${base} bg-orange-900/40 text-orange-300 ring-orange-700`}
      >
        {label}
      </span>
    );
  }

  if (normalized === "video") {
    return (
      <span className={`${base} bg-teal-900/40 text-teal-300 ring-teal-700`}>
        {label}
      </span>
    );
  }

  return (
    <span className={`${base} bg-zinc-900/60 text-zinc-300 ring-zinc-700`}>
      {label}
    </span>
  );
}
