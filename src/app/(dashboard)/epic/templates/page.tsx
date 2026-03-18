import Link from "next/link";
import { BLOG_TEMPLATES } from "@/lib/blog/templates";
import { NewsletterTemplatePreview } from "@/components/newsletter/preview/NewsletterTemplatePreview";

const CATEGORY_COLORS: Record<string, string> = {
  Tutorial: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  Listicle: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
  Opinion: "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20",
  Technical: "bg-sky-500/10 text-sky-300 border-sky-500/20",
  Interview: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  "Case Study": "bg-blue-500/10 text-blue-300 border-blue-500/20",
  Resource: "bg-teal-500/10 text-teal-300 border-teal-500/20",
  Review: "bg-teal-400/10 text-teal-300 border-teal-400/20",
  Travel: "bg-orange-500/10 text-orange-300 border-orange-500/20",
  Analysis: "bg-blue-600/10 text-blue-200 border-blue-600/20",
  Personal: "bg-stone-500/10 text-stone-300 border-stone-500/20",
  News: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
};

function CategoryBadge({ category }: { category: string }) {
  const cls =
    CATEGORY_COLORS[category] ??
    "bg-zinc-700/40 text-zinc-300 border-zinc-600/30";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls}`}
    >
      {category}
    </span>
  );
}

export default function BlogTemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-50">Blog Templates</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Pick a template, customise the content, then save as a draft blog
            post.
          </p>
        </div>
        <Link
          href="/epic"
          className="shrink-0 text-xs text-zinc-500 underline-offset-2 hover:text-zinc-300 hover:underline"
        >
          ← Back to Content Studio
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Blank card — always first */}
        <article className="group flex flex-col rounded-xl border border-dashed border-zinc-700 bg-zinc-950/40 p-5 transition hover:border-zinc-500 hover:bg-zinc-900/50">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-white">
              Blank Blog
            </h3>
            <span className="inline-flex items-center rounded-full border border-zinc-600/30 bg-zinc-700/40 px-2 py-0.5 text-[11px] font-medium text-zinc-300">
              Blank
            </span>
          </div>
          <p className="mt-2 flex-1 text-xs text-zinc-400 leading-relaxed">
            Start with an empty editor and write freely.
          </p>
          <div className="mt-4 flex h-28 items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-900/30">
            <svg className="h-8 w-8 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <Link
            href="/epic/templates/blank"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800 hover:text-zinc-50"
          >
            Start from scratch
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </Link>
        </article>

        {BLOG_TEMPLATES.map((tpl) => (
          <article
            key={tpl.id}
            className="group flex flex-col rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 transition hover:border-zinc-600 hover:bg-zinc-900/70"
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

            <div className="mt-4">
              <NewsletterTemplatePreview
                title={tpl.initialValues.title}
                description={tpl.initialValues.description}
                body={tpl.initialValues.body}
                bannerImageUrl={tpl.initialValues.bannerImageUrl ?? null}
                tags={tpl.initialValues.tagsInput
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)}
                style={tpl.style}
                mode="thumbnail"
              />
            </div>

            <Link
              href={`/epic/templates/${tpl.id}`}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-white"
            >
              Use this template
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

