"use client";

import { useState } from "react";

export interface SeoData {
  title?: string;
  description?: string;
  focusKeyword?: string;
  keywords?: string[];
  searchIntent?: string;
  relatedQuestions?: string[];
}

interface EpicSeoPanelProps {
  newsletterId: string;
  topic: string;
  tags?: string[];
  initialSeoData?: SeoData;
}

function CharCounter({
  value,
  max,
}: {
  value: string;
  max: number;
}) {
  const len = value.length;
  const isOver = len > max;
  const isClose = len > max * 0.85;
  return (
    <span
      className={[
        "ml-1 text-[10px] font-medium",
        isOver ? "text-red-400" : isClose ? "text-amber-400" : "text-zinc-500",
      ].join(" ")}
    >
      {len}/{max}
    </span>
  );
}

export function EpicSeoPanel({
  newsletterId,
  topic,
  tags = [],
  initialSeoData = {},
}: EpicSeoPanelProps) {
  const [seo, setSeo] = useState<SeoData>(initialSeoData);
  const [keywordsInput, setKeywordsInput] = useState(
    initialSeoData.keywords?.join(", ") ?? "",
  );
  const [researching, setResearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleResearch() {
    setResearching(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/seo-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          tags,
          contentId: newsletterId,
        }),
      });
      const json = (await res.json()) as {
        data?: {
          focusKeyword: string;
          secondaryKeywords: string[];
          searchIntent: string;
          relatedQuestions: string[];
          suggestedTitle: string;
          suggestedDescription: string;
        };
        error?: string;
      };

      if (!res.ok || !json.data) {
        setError(json.error ?? "Keyword research failed. Please try again.");
        return;
      }

      const updated: SeoData = {
        focusKeyword: json.data.focusKeyword,
        keywords: json.data.secondaryKeywords,
        title: json.data.suggestedTitle,
        description: json.data.suggestedDescription,
        searchIntent: json.data.searchIntent,
        relatedQuestions: json.data.relatedQuestions,
      };
      setSeo(updated);
      setKeywordsInput(json.data.secondaryKeywords.join(", "));
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setResearching(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const keywordsArr = keywordsInput
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const patchSeo: SeoData = {
        ...seo,
        keywords: keywordsArr,
      };

      const res = await fetch(`/api/newsletters/${newsletterId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ epicMetadataSeo: patchSeo }),
      });

      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        setError(json.error ?? "Failed to save SEO settings.");
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Network error while saving.");
    } finally {
      setSaving(false);
    }
  }

  const relatedQuestions = seo.relatedQuestions ?? [];

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 text-xs text-zinc-300">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="font-medium text-zinc-200">SEO Optimization</p>
        <button
          type="button"
          onClick={handleResearch}
          disabled={researching}
          className="flex items-center gap-1.5 rounded-md bg-cyan-600/20 px-2.5 py-1 text-[11px] font-medium text-cyan-300 hover:bg-cyan-600/30 disabled:opacity-50 transition-colors"
        >
          {researching ? (
            <>
              <svg
                className="h-3 w-3 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Researching…
            </>
          ) : (
            <>
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Run Keyword Research
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-3 rounded-md bg-red-950/50 px-3 py-2 text-[11px] text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {/* Focus keyword */}
        <div>
          <label className="mb-1 flex items-center justify-between text-zinc-400">
            <span>Focus Keyword</span>
            {seo.searchIntent && (
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] capitalize text-zinc-400">
                {seo.searchIntent}
              </span>
            )}
          </label>
          <input
            type="text"
            value={seo.focusKeyword ?? ""}
            onChange={(e) => setSeo((s) => ({ ...s, focusKeyword: e.target.value }))}
            placeholder="e.g. content marketing strategy"
            className="w-full rounded-md border border-zinc-700/60 bg-zinc-950/60 px-2.5 py-1.5 text-[11px] text-zinc-100 placeholder-zinc-600 outline-none focus:border-cyan-600/60 focus:ring-1 focus:ring-cyan-600/40"
          />
        </div>

        {/* Meta title */}
        <div>
          <label className="mb-1 flex items-center text-zinc-400">
            <span>Meta Title</span>
            <CharCounter value={seo.title ?? ""} max={60} />
          </label>
          <input
            type="text"
            value={seo.title ?? ""}
            onChange={(e) => setSeo((s) => ({ ...s, title: e.target.value }))}
            placeholder="SEO page title (≤60 chars)"
            className="w-full rounded-md border border-zinc-700/60 bg-zinc-950/60 px-2.5 py-1.5 text-[11px] text-zinc-100 placeholder-zinc-600 outline-none focus:border-cyan-600/60 focus:ring-1 focus:ring-cyan-600/40"
          />
        </div>

        {/* Meta description */}
        <div>
          <label className="mb-1 flex items-center text-zinc-400">
            <span>Meta Description</span>
            <CharCounter value={seo.description ?? ""} max={160} />
          </label>
          <textarea
            value={seo.description ?? ""}
            onChange={(e) => setSeo((s) => ({ ...s, description: e.target.value }))}
            placeholder="Compelling meta description (≤160 chars)"
            rows={3}
            className="w-full resize-none rounded-md border border-zinc-700/60 bg-zinc-950/60 px-2.5 py-1.5 text-[11px] text-zinc-100 placeholder-zinc-600 outline-none focus:border-cyan-600/60 focus:ring-1 focus:ring-cyan-600/40"
          />
        </div>

        {/* Secondary keywords */}
        <div>
          <label className="mb-1 block text-zinc-400">
            Secondary Keywords{" "}
            <span className="text-zinc-600">(comma-separated)</span>
          </label>
          <textarea
            value={keywordsInput}
            onChange={(e) => setKeywordsInput(e.target.value)}
            placeholder="e.g. email marketing, newsletter automation, AI content"
            rows={2}
            className="w-full resize-none rounded-md border border-zinc-700/60 bg-zinc-950/60 px-2.5 py-1.5 text-[11px] text-zinc-100 placeholder-zinc-600 outline-none focus:border-cyan-600/60 focus:ring-1 focus:ring-cyan-600/40"
          />
        </div>

        {/* Related questions */}
        {relatedQuestions.length > 0 && (
          <div>
            <p className="mb-1.5 text-zinc-400">
              Related Questions{" "}
              <span className="text-zinc-600">(People Also Ask)</span>
            </p>
            <ul className="space-y-1">
              {relatedQuestions.map((q, i) => (
                <li
                  key={i}
                  className="flex items-start gap-1.5 text-[11px] text-zinc-400"
                >
                  <span className="mt-0.5 flex-shrink-0 text-zinc-600">?</span>
                  {q}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-md bg-cyan-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-cyan-500 disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <>
              <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving…
            </>
          ) : saved ? (
            <>
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Saved!
            </>
          ) : (
            "Save SEO Settings"
          )}
        </button>
      </div>
    </div>
  );
}
