"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "gencontent_onboarding_dismissed_v1";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  href: string;
  cta: string;
}

const ITEMS: ChecklistItem[] = [
  {
    id: "create_epic",
    label: "Create your first EPIC",
    description: "Head to Content Studio and generate a newsletter, blog post, or image.",
    href: "/epic",
    cta: "Go to Content Studio",
  },
  {
    id: "add_subscribers",
    label: "Add subscribers",
    description: "Import or manually add your first subscribers so you can send to them.",
    href: "/subscribers",
    cta: "View Subscribers",
  },
  {
    id: "schedule_send",
    label: "Schedule or publish a newsletter",
    description: "Pick any drafted EPIC and schedule it for a future send, or publish immediately.",
    href: "/epic",
    cta: "Open Content Studio",
  },
];

interface OnboardingChecklistProps {
  hasContent: boolean;
  hasSubscribers: boolean;
  hasPublished: boolean;
}

export function OnboardingChecklist({
  hasContent,
  hasSubscribers,
  hasPublished,
}: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      setDismissed(stored === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  const completedMap: Record<string, boolean> = {
    create_epic: hasContent,
    add_subscribers: hasSubscribers,
    schedule_send: hasPublished,
  };

  const allDone = ITEMS.every((item) => completedMap[item.id]);

  if (dismissed || allDone) return null;

  return (
    <section
      aria-labelledby="onboarding-title"
      className="rounded-xl border border-zinc-700/60 bg-zinc-900/50 p-4"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2
            id="onboarding-title"
            className="text-sm font-semibold text-zinc-100"
          >
            Get started with GenContent AI
          </h2>
          <p className="mt-0.5 text-xs text-zinc-400">
            Complete these steps to make the most of the platform.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss onboarding checklist"
          className="shrink-0 text-zinc-500 hover:text-zinc-200"
        >
          ✕
        </button>
      </div>

      <ul className="space-y-2">
        {ITEMS.map((item) => {
          const done = completedMap[item.id] ?? false;
          return (
            <li
              key={item.id}
              className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 ${
                done
                  ? "border-emerald-800/50 bg-emerald-950/30"
                  : "border-zinc-800 bg-zinc-950/40"
              }`}
            >
              <span
                aria-hidden
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ring-1 ${
                  done
                    ? "bg-emerald-700/30 text-emerald-300 ring-emerald-700"
                    : "bg-zinc-800 text-zinc-400 ring-zinc-700"
                }`}
              >
                {done ? "✓" : "○"}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-medium ${
                    done ? "text-zinc-400 line-through" : "text-zinc-100"
                  }`}
                >
                  {item.label}
                </p>
                {!done && (
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {item.description}
                  </p>
                )}
              </div>
              {!done && (
                <Link
                  href={item.href}
                  className="shrink-0 rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
                >
                  {item.cta}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
