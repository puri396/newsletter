import Link from "next/link";
import { IMAGE_TEMPLATES } from "@/lib/image/templates";

const CATEGORY_COLORS: Record<string, string> = {
  General:   "bg-zinc-700/40 text-zinc-300 border-zinc-600/30",
  Tech:      "bg-blue-500/10 text-blue-300 border-blue-500/20",
  Marketing: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  Abstract:  "bg-violet-500/10 text-violet-300 border-violet-500/20",
  Editorial: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20",
  Data:      "bg-teal-500/10 text-teal-300 border-teal-500/20",
};

function CategoryBadge({ category }: { category: string }) {
  const cls =
    CATEGORY_COLORS[category] ?? "bg-zinc-700/40 text-zinc-300 border-zinc-600/30";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls}`}
    >
      {category}
    </span>
  );
}

export default function BrowseImagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-50">Browse Images</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Pick a style preset, then generate an AI image using the pre-filled prompt.
          </p>
        </div>
        <Link
          href="/epic"
          className="shrink-0 text-xs text-zinc-500 underline-offset-2 hover:text-zinc-300 hover:underline"
        >
          ← Back to All Content
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {IMAGE_TEMPLATES.map((tpl) => (
          <article
            key={tpl.id}
            className={`group flex flex-col rounded-xl border bg-zinc-950/60 p-5 transition hover:bg-zinc-900/70 ${
              tpl.id === "blank"
                ? "border-dashed border-zinc-700 hover:border-zinc-500"
                : "border-zinc-800 hover:border-zinc-600"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-white">
                {tpl.name}
              </h3>
              <CategoryBadge category={tpl.category} />
            </div>

            <p className="mt-2 flex-1 text-xs text-zinc-400 leading-relaxed">
              {tpl.description}
            </p>

            {/* Gradient thumbnail */}
            <div
              className="mt-4 flex h-28 items-center justify-center rounded-lg"
              style={{ background: tpl.exampleStyle }}
            >
              {tpl.id === "blank" ? (
                <svg
                  className="h-8 w-8 text-zinc-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              ) : (
                <svg
                  className="h-8 w-8 text-white/30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              )}
            </div>

            <Link
              href={`/images/${tpl.id}`}
              className={`mt-4 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                tpl.id === "blank"
                  ? "border border-zinc-600 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-50"
                  : "bg-zinc-100 text-zinc-900 hover:bg-white"
              }`}
            >
              {tpl.id === "blank" ? "Start from scratch" : "Use this style"}
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
