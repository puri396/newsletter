"use client";

import { useEffect, useRef, useCallback } from "react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);

  const handleConfirm = useCallback(async () => {
    await onConfirm();
    onClose();
  }, [onConfirm, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    previousActiveRef.current = document.activeElement as HTMLElement | null;
    const focusTarget = overlayRef.current?.querySelector<HTMLElement>(
      '[data-confirm-dialog-focus]',
    );
    focusTarget?.focus();
    return () => {
      previousActiveRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const root = overlayRef.current;
    if (!root) return;
    const focusables = root.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    root.addEventListener("keydown", handleTab);
    return () => root.removeEventListener("keydown", handleTab);
  }, [open]);

  if (!open) return null;

  const confirmClass =
    variant === "danger"
      ? "bg-red-700 text-white hover:bg-red-600 focus:ring-red-500"
      : "bg-zinc-700 text-zinc-100 hover:bg-zinc-600 focus:ring-zinc-500";

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
      onKeyDown={handleKeyDown}
    >
      <div
        className="absolute inset-0 bg-black/60"
        aria-hidden
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 p-4 shadow-xl">
        <h2
          id="confirm-dialog-title"
          className="text-base font-semibold text-zinc-50"
        >
          {title}
        </h2>
        <p
          id="confirm-dialog-desc"
          className="mt-2 text-sm text-zinc-400"
        >
          {description}
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-zinc-600 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50"
            data-confirm-dialog-focus
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 min-h-[44px] min-w-[80px] ${confirmClass}`}
          >
            {loading ? "..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
