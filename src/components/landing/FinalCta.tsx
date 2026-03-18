import Link from "next/link";

export function FinalCta() {
  return (
    <section
      id="cta"
      className="overflow-hidden w-full sm:w-2/3 flex justify-center items-center bg-gradient-to-r from-indigo-500/5 via-fuchsia-500/5 to-sky-500/5 p-[1px] mx-auto"
      style={{ borderRadius: "10px", backgroundColor: "#fff" }}
    >
      <div className="flex  flex-col items-center gap-4 bg-white px-6 py-10 text-center sm:px-10 sm:py-12 lg:flex-row lg:justify-between lg:text-left">
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
            Start Creating AI-Powered Newsletters Today
          </h2>
          <p className="text-sm text-slate-600">
            Launch your first AI-assisted newsletter in minutes. No complex
            setup, no content bottlenecks.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-cyan-500 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
          >
            Start Free
          </Link>
        </div>
      </div>
    </section>
  );
}
