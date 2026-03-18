import Link from "next/link";

const NAV_ITEMS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "/blog", label: "Blog" },
  { href: "/subscribe", label: "Subscribe" },
];

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-slate-700/60 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-8xl items-center justify-between px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-400 via-emerald-400 to-cyan-500 text-xs font-semibold text-slate-950">
            GC
          </div>
          <span className="text-[17px] font-semibold tracking-tight text-slate-50">
          GenContent AI
          </span>
        </div>

        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="transition-colors hover:text-slate-50"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden rounded-full border border-slate-500 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800 md:inline-flex"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="hidden rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm transition hover:brightness-110 md:inline-flex"
          >
            Start Free
          </Link>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-600 bg-slate-900/70 text-slate-200 md:hidden"
            aria-label="Open navigation"
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
}

