import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-slate-400 sm:flex-row sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} GenContent AI. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/blog" className="transition hover:text-slate-200">Blog</Link>
          <Link href="/privacy" className="transition hover:text-slate-200">Privacy</Link>
          <Link href="/terms" className="transition hover:text-slate-200">Terms</Link>
          <Link href="/feed.xml" className="transition hover:text-slate-200">RSS</Link>
        </div>
      </div>
    </footer>
  );
}
