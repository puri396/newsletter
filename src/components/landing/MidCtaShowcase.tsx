import Link from "next/link";

export function MidCtaShowcase() {
  return (
    <section className="rounded-[32px] bg-gradient-to-r from-[#5b4bdb] via-[#9b5de5] to-[#f15bb5] p-[1px]">
      <div className="grid gap-8 rounded-[30px] bg-white px-6 py-8 sm:px-10 sm:py-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)] md:items-center lg:px-14 lg:py-12">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
            ContentPilot studio
          </p>
          <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
            Start creating updates that{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-sky-500 bg-clip-text text-transparent">
              ship in minutes
            </span>
          </h2>
          <p className="text-sm text-slate-600 sm:text-base">
            Draft newsletters, blog posts, and announcement images in one place.
            AI helps you get to a strong first version—then your team edits and
            sends across email and WhatsApp.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-sky-400 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
            >
              Start designing now
            </Link>
            <span className="text-xs text-slate-500">
              No credit card required. Use your own email & AI providers.
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-[28px] bg-gradient-to-tr from-[#7c6aed]/40 via-[#c77dff]/35 to-[#f15bb5]/35 blur-2xl" />
          <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#5b4bdb] via-[#9b5de5] to-[#f15bb5] p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-sky-400 text-[11px] font-semibold">
                  CP
                </span>
                <div>
                  <p className="font-medium">Weekly product update</p>
                  <p className="text-[11px] text-slate-400">
                    Content Studio · Newsletter
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-medium text-emerald-300">
                Draft ready
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div className="space-y-2 rounded-2xl bg-slate-900/80 p-3">
                <div className="h-2.5 w-1/3 rounded-full bg-indigo-400/80" />
                <div className="space-y-1.5">
                  <div className="h-2 w-full rounded-full bg-slate-700/70" />
                  <div className="h-2 w-11/12 rounded-full bg-slate-700/60" />
                  <div className="h-2 w-10/12 rounded-full bg-slate-700/50" />
                  <div className="h-2 w-9/12 rounded-full bg-slate-700/50" />
                </div>
                <div className="mt-2 flex gap-2">
                  <span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] text-slate-300">
                    #ReleaseNotes
                  </span>
                  <span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] text-slate-300">
                    #Changelog
                  </span>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl bg-slate-900/80 p-3">
                <div className="h-20 rounded-xl bg-gradient-to-br from-indigo-500/50 via-fuchsia-500/40 to-sky-400/50" />
                <div className="flex items-center justify-between rounded-full bg-slate-900 px-3 py-1.5 text-[11px] text-slate-200 shadow-[0_0_18px_rgba(129,140,248,0.8)]">
                  <span>“Infographic about this week&apos;s launch…”</span>
                  <span className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-50 text-slate-900">
                    →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

