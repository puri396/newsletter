"use client";

export type EpicStatus = "draft" | "published" | "scheduled";

interface StatusControlsProps {
  value: EpicStatus;
  onChange: (value: EpicStatus) => void;
  disabled?: boolean;
}

const OPTIONS: { value: EpicStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Public" },
  { value: "scheduled", label: "Scheduled" },
];

export function StatusControls({
  value,
  onChange,
  disabled = false,
}: StatusControlsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          disabled={disabled}
          onClick={() => onChange(opt.value)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            value === opt.value
              ? "bg-zinc-100 text-zinc-950"
              : "bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
