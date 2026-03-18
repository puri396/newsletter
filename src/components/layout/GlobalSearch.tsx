"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface SearchResult {
  type: string;
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  newsletter: { label: "Newsletter", color: "text-sky-400" },
  blog: { label: "Blog", color: "text-emerald-400" },
  subscriber: { label: "Subscriber", color: "text-violet-400" },
  image: { label: "Image", color: "text-amber-400" },
  video: { label: "Video", color: "text-rose-400" },
};

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = (await res.json()) as { results?: SearchResult[] };
        setResults(data.results ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut Cmd/Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search… ⌘K"
          className="h-8 w-full rounded-lg border border-zinc-700 bg-zinc-800/80 pl-8 pr-3 text-xs text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
        />
        {loading && (
          <div className="absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full z-50 mt-1 w-full min-w-[280px] overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl">
          <ul>
            {results.map((result) => {
              const typeInfo = TYPE_LABELS[result.type] ?? { label: result.type, color: "text-zinc-400" };
              return (
                <li key={`${result.type}-${result.id}`}>
                  <Link
                    href={result.href}
                    onClick={() => { setOpen(false); setQuery(""); }}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-800 transition"
                  >
                    <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-zinc-100">{result.title}</p>
                      {result.subtitle && (
                        <p className="truncate text-[10px] text-zinc-500">{result.subtitle}</p>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-zinc-800 px-3 py-1.5 text-[10px] text-zinc-600">
            Press Esc to close
          </div>
        </div>
      )}

      {open && results.length === 0 && !loading && query.length >= 2 && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-4 text-center shadow-xl">
          <p className="text-xs text-zinc-500">No results for &quot;{query}&quot;</p>
        </div>
      )}
    </div>
  );
}
