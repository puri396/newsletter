"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ToastVariant = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, variant?: ToastVariant) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timerMap = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timerMap.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timerMap.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      setToasts((prev) => [...prev, { id, message, variant }]);
      const timer = setTimeout(() => removeToast(id), 5000);
      timerMap.current.set(id, timer);
    },
    [removeToast],
  );

  useEffect(
    () => () => {
      timerMap.current.forEach(clearTimeout);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

const NOOP_TOAST: ToastContextValue = {
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  // Return a no-op fallback during SSR or if used outside the provider.
  // Actual toast functionality is wired up on the client once the provider mounts.
  return ctx ?? NOOP_TOAST;
}

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success:
    "border-emerald-700 bg-emerald-950/90 text-emerald-200",
  error:
    "border-red-700 bg-red-950/90 text-red-200",
  info:
    "border-zinc-700 bg-zinc-900/95 text-zinc-100",
};

const VARIANT_ICON: Record<ToastVariant, string> = {
  success: "✓",
  error: "✕",
  info: "i",
};

function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col gap-2"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto flex min-w-[240px] max-w-sm items-start gap-2.5 rounded-lg border px-4 py-3 text-sm shadow-lg transition-all ${VARIANT_STYLES[t.variant]}`}
        >
          <span
            className="mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ring-1 ring-current"
            aria-hidden
          >
            {VARIANT_ICON[t.variant]}
          </span>
          <span className="flex-1 leading-snug">{t.message}</span>
          <button
            type="button"
            onClick={() => onRemove(t.id)}
            aria-label="Dismiss notification"
            className="ml-1 shrink-0 opacity-60 hover:opacity-100"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
