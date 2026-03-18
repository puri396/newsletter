import Link from "next/link";

export function Hero() {
  return (
    <section className="mt-6 grid gap-12 pb-10 max-w-[1440px] w-full mx-auto md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:items-center">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/50 bg-slate-900/60 px-3 py-1 text-xs font-medium text-emerald-200 shadow-[0_0_0_1px_rgba(16,185,129,0.25)]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.9)]" />
          AI Content Studio for newsletters, blogs & images
        </div>
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl lg:text-6xl">
          Run your{" "}
          <span className="bg-gradient-to-r from-sky-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">
            AI-Powered Content Studio
          </span>{" "}
          for Newsletters, Blogs & Images
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
          Generate engaging newsletters, blog posts, images, and email campaigns
          automatically with AI from a single content studio. Go from idea to
          send-ready content in less than a minute.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-cyan-500 px-7 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_50px_rgba(34,211,238,0.45)] transition hover:brightness-110"
          >
            Start Free
          </Link>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-600 bg-slate-900/80 px-6 py-3 text-sm font-medium text-slate-100 shadow-sm transition hover:border-slate-400 hover:bg-slate-800"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-900">
              ▶
            </span>
            Watch Demo
          </button>
        </div>
        <div className="flex flex-wrap gap-6 text-xs text-slate-400">
          <span>✓ No credit card required</span>
          <span>✓ Drafts, images & campaigns</span>
          <span>✓ Built for SaaS teams</span>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 rounded-[32px] bg-gradient-to-tr from-sky-500/30 via-emerald-400/25 to-cyan-500/30 blur-3xl" />
        <div className="relative rounded-[24px] border border-slate-700/70 bg-slate-950/70 p-5 shadow-[0_22px_70px_rgba(15,23,42,0.85)] backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-sky-400 via-emerald-400 to-cyan-500" />
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-slate-50">
                  GenContent AI Studio
                </p>
                <p className="text-[11px] text-slate-400">
                  Draft: Weekly Product Update
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
              4.8 ★
            </span>
          </div>

          <div className="space-y-3 rounded-2xl bg-slate-900/70 p-4 ring-1 ring-slate-700/80">
            <div className="h-3 w-28 rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-cyan-400" />
            <div className="space-y-2">
              <div className="h-2.5 w-full rounded-full bg-slate-700/70" />
              <div className="h-2.5 w-11/12 rounded-full bg-slate-700/70" />
              <div className="h-2.5 w-9/12 rounded-full bg-slate-700/70" />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-4">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-slate-100">
                Auto-personalized per segment
              </p>
              <p className="text-[11px] text-slate-400">
                Tone, structure and CTAs adapt automatically while staying
                on-brand.
              </p>
            </div>
            <div className="relative h-16 w-16 rounded-[22px] bg-gradient-to-tr from-sky-400 via-emerald-400 to-cyan-500">
              <div className="absolute inset-1 rounded-[20px] bg-slate-950" />
              <div className="absolute inset-2 flex items-center justify-center rounded-[18px] bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="h-9 w-9 rounded-3xl bg-slate-100 text-xs font-semibold text-slate-900 flex items-center justify-center">
                  AI
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

