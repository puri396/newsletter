"use client";

import type { ReactNode } from "react";

interface FormFieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

export function FormField({
  id,
  label,
  hint,
  error,
  children,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-zinc-300">
        {label}
        {hint ? (
          <span className="ml-1 text-[11px] text-zinc-500">{hint}</span>
        ) : null}
      </label>
      <div className="mt-1">{children}</div>
      {error ? (
        <p className="mt-1 text-xs text-red-400">{error}</p>
      ) : null}
    </div>
  );
}
