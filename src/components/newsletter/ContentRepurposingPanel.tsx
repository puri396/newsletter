"use client";

import { useState, useCallback, useMemo } from "react";
import { PhoneFramePreview, type PhoneFrameMode } from "@/components/ui/PhoneFramePreview";
import { getApiErrorMessage } from "@/lib/api/get-error-message";

interface RepurposeOutput {
  reelScript: string;
  hooks: string[];
  ctas: string[];
  linkedin: string;
  twitter: string;
  instagram: string;
  hashtags: string[];
}

interface ContentRepurposingPanelProps {
  newsletterBody: string;
  newsletterSubject?: string;
}

export function ContentRepurposingPanel({
  newsletterBody,
  newsletterSubject,
}: ContentRepurposingPanelProps) {
  const [data, setData] = useState<RepurposeOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [phoneMode, setPhoneMode] = useState<PhoneFrameMode>("hook");

  const [imagePrompts, setImagePrompts] = useState<string[]>([]);
  const [imagePromptsLoading, setImagePromptsLoading] = useState(false);
  const [imagePromptsError, setImagePromptsError] = useState<string | null>(null);

  const copyToClipboard = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    const body = newsletterBody.trim();
    if (!body) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsletterBody: body }),
      });
      const json = (await res.json()) as RepurposeOutput & { error?: string };
      if (!res.ok) {
        setError(getApiErrorMessage(json, "Failed to generate."));
        return;
      }
      setData(json);
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [newsletterBody]);

  const handleGenerateImagePrompts = useCallback(async () => {
    const body = newsletterBody.trim();
    if (!body) return;
    setImagePromptsError(null);
    setImagePromptsLoading(true);
    try {
      const res = await fetch("/api/ai/image-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsletterBody: body }),
      });
      const json = (await res.json()) as { imagePrompts?: string[]; error?: string };
      if (!res.ok) {
        setImagePromptsError(getApiErrorMessage(json, "Failed to generate."));
        return;
      }
      setImagePrompts(Array.isArray(json.imagePrompts) ? json.imagePrompts : []);
    } catch {
      setImagePromptsError("Unable to reach the server. Please try again.");
    } finally {
      setImagePromptsLoading(false);
    }
  }, [newsletterBody]);

  const phoneContent = useMemo(() => {
    if (!data) return "Generate repurposed content above to preview hook, script, and caption here.";
    if (phoneMode === "hook") return data.hooks.join("\n\n");
    if (phoneMode === "script") return data.reelScript;
    return data.instagram || data.linkedin || "No caption.";
  }, [data, phoneMode]);

  const hasBody = newsletterBody.trim().length > 0;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
      <h2 className="text-sm font-semibold text-zinc-200">
        Content Repurposing
      </h2>
      <p className="mt-1 text-xs text-zinc-500">
        Generate reel script, hooks, CTAs, and platform captions from this
        newsletter. All fields are copyable.
      </p>

      {!hasBody && (
        <p className="mt-4 text-sm text-zinc-500">
          This newsletter has no body to repurpose. Add content above first.
        </p>
      )}

      {error && (
        <div
          className="mt-4 rounded-lg border border-red-800/60 bg-red-950/30 px-3 py-2 text-sm text-red-200"
          role="alert"
        >
          {error}
        </div>
      )}

      {hasBody && (
        <div className="mt-4">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Generating…" : "Generate repurposed content"}
          </button>
        </div>
      )}

      {data && (
        <div className="mt-6 space-y-4">
          <CollapsibleSection
            id="reel"
            title="Reel script"
            content={data.reelScript}
            copiedId={copiedId}
            onCopy={copyToClipboard}
          />
          <CollapsibleSection
            id="hooks"
            title="Hooks"
            content={data.hooks.join("\n\n")}
            copiedId={copiedId}
            onCopy={copyToClipboard}
          />
          <CollapsibleSection
            id="ctas"
            title="CTAs"
            content={data.ctas.join("\n\n")}
            copiedId={copiedId}
            onCopy={copyToClipboard}
          />
          <CollapsiblePlatformCaptions
            data={data}
            copiedId={copiedId}
            onCopy={copyToClipboard}
          />
        </div>
      )}

      {/* Mobile Preview */}
      <section className="mt-8 border-t border-zinc-800 pt-6">
        <h3 className="text-sm font-semibold text-zinc-200">Mobile preview</h3>
        <p className="mt-1 text-xs text-zinc-500">
          Simulate how content looks in a vertical phone view.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["hook", "script", "caption"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setPhoneMode(mode)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                phoneMode === mode
                  ? "bg-zinc-100 text-zinc-900"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
              }`}
            >
              {mode === "hook" ? "Hook" : mode === "script" ? "Reel script" : "Caption"}
            </button>
          ))}
        </div>
        <div className="mt-4">
          <PhoneFramePreview mode={phoneMode} content={phoneContent} />
        </div>
      </section>

      {/* Image Prompts */}
      <section className="mt-8 border-t border-zinc-800 pt-6">
        <h3 className="text-sm font-semibold text-zinc-200">Image prompts</h3>
        <p className="mt-1 text-xs text-zinc-500">
          Generate thumbnail/cover prompt ideas for Shorts or Reels (text only).
        </p>
        {hasBody && (
          <>
            <div className="mt-3">
              <button
                type="button"
                onClick={handleGenerateImagePrompts}
                disabled={imagePromptsLoading}
                className="inline-flex items-center justify-center rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {imagePromptsLoading ? "Generating…" : "Generate image prompts"}
              </button>
            </div>
            {imagePromptsError && (
              <p className="mt-2 text-sm text-red-400" role="alert">
                {imagePromptsError}
              </p>
            )}
            {imagePrompts.length > 0 && (
              <div className="mt-4 space-y-2">
                {imagePrompts.map((prompt, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3"
                  >
                    <p className="text-sm text-zinc-200 flex-1 min-w-0">
                      {prompt}
                    </p>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(prompt, `img-${i}`)}
                      className="shrink-0 rounded px-2 py-1 text-xs font-medium bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                    >
                      {copiedId === `img-${i}` ? "Copied!" : "Copy"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function CollapsiblePlatformCaptions({
  data,
  copiedId,
  onCopy,
}: {
  data: RepurposeOutput;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium text-zinc-300 hover:bg-zinc-800/50"
        aria-expanded={open}
      >
        Platform captions
        <span className="text-zinc-500">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="border-t border-zinc-800 p-3 space-y-3">
          <CopyBlock
            id="linkedin"
            label="LinkedIn"
            content={data.linkedin}
            copiedId={copiedId}
            onCopy={onCopy}
          />
          <CopyBlock
            id="twitter"
            label="X (Twitter)"
            content={data.twitter}
            copiedId={copiedId}
            onCopy={onCopy}
          />
          <CopyBlock
            id="instagram"
            label="Instagram"
            content={data.instagram}
            copiedId={copiedId}
            onCopy={onCopy}
          />
          <CopyBlock
            id="hashtags"
            label="Hashtags"
            content={data.hashtags.join(" ")}
            copiedId={copiedId}
            onCopy={onCopy}
          />
        </div>
      )}
    </div>
  );
}

function CollapsibleSection({
  id,
  title,
  content,
  copiedId,
  onCopy,
}: {
  id: string;
  title: string;
  content: string;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  if (!content) return null;
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium text-zinc-300 hover:bg-zinc-800/50"
        aria-expanded={open}
      >
        {title}
        <span className="text-zinc-500">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="border-t border-zinc-800 p-3 flex items-start justify-between gap-2">
          <p className="text-sm text-zinc-200 whitespace-pre-wrap flex-1 min-w-0">
            {content}
          </p>
          <button
            type="button"
            onClick={() => onCopy(content, id)}
            className="shrink-0 rounded px-2 py-1 text-xs font-medium bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
          >
            {copiedId === id ? "Copied!" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}

function CopyBlock({
  id,
  label,
  content,
  copiedId,
  onCopy,
}: {
  id: string;
  label: string;
  content: string;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
}) {
  if (!content) return null;
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
          {label}
        </p>
        <p className="mt-1 text-sm text-zinc-200 whitespace-pre-wrap">
          {content}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onCopy(content, id)}
        className="shrink-0 rounded px-2 py-1 text-xs font-medium bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
      >
        {copiedId === id ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
