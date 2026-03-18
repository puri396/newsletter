"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getApiErrorMessage } from "@/lib/api/get-error-message";

const inputClass =
  "w-full rounded-md border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-50 outline-none transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 placeholder:text-zinc-500";

interface ImageCreatorFormProps {
  defaultPrompt: string;
  templateName: string;
  exampleStyle: string;
}

export function ImageCreatorForm({
  defaultPrompt,
  templateName,
  exampleStyle,
}: ImageCreatorFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(templateName === "Blank" ? "" : templateName);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a title for your image.");
      return;
    }
    if (!prompt.trim()) {
      setError("Please enter a prompt describing the image you want to create.");
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/epic/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "image",
          title: title.trim(),
          description: prompt.trim(),
          aiProvider: "huggingface",
          status: "draft",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          getApiErrorMessage(data) ?? `Request failed with status ${res.status}`,
        );
      }

      const data = (await res.json()) as { data?: { id?: string } };
      const id = data?.data?.id;

      if (id) {
        router.push(`/epic/view/${id}`);
      } else {
        router.push("/epic");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
      setGenerating(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Style preview */}
      <div className="lg:col-span-2">
        <div
          className="flex aspect-video w-full items-center justify-center rounded-xl border border-zinc-800"
          style={{ background: exampleStyle }}
        >
          <svg
            className="h-12 w-12 text-white/20"
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
        </div>
        <p className="mt-3 text-center text-xs text-zinc-500">
          Style preview — Hugging Face will generate the actual image
        </p>

        {/* Provider badge */}
        <div className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2">
          <svg
            className="h-4 w-4 text-yellow-400"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
          </svg>
          <span className="text-xs font-medium text-zinc-300">
            Powered by Hugging Face
          </span>
          <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] font-medium text-yellow-400 border border-yellow-500/20">
            FLUX.1-schnell
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 lg:col-span-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              Title{" "}
              <span className="text-zinc-500">(used as the content title)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Product launch announcement image"
              className={inputClass}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              Image Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate…"
              rows={6}
              className={inputClass}
              required
            />
            <p className="text-[11px] text-zinc-500">
              Be specific about style, colors, mood, and composition for best results.
            </p>
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={generating}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-100 px-5 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {generating ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeOpacity="0.25"
                />
                <path d="M21 12a9 9 0 00-9-9" />
              </svg>
              Generating with Hugging Face…
            </>
          ) : (
            <>
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Generate Image
            </>
          )}
        </button>
      </form>
    </div>
  );
}
