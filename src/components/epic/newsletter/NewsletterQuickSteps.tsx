"use client";

import { useState, type FormEvent } from "react";
import { FormField } from "@/components/ui/FormField";

const TONE_OPTIONS = [
  { value: "friendly", label: "Friendly" },
  { value: "professional", label: "Professional" },
  { value: "technical", label: "Technical" },
  { value: "marketing", label: "Marketing" },
  { value: "informative", label: "Informative" },
] as const;

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Publish" },
] as const;

const AI_PROVIDERS = [
  { value: "openai", label: "OpenAI" },
  { value: "gemini", label: "Google Gemini" },
  { value: "claude", label: "Anthropic Claude" },
  { value: "leonardo", label: "Leonardo" },
] as const;

const MODELS_BY_PROVIDER: Record<
  string,
  readonly { value: string; label: string }[]
> = {
  openai: [
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4.1", label: "GPT-4.1" },
    { value: "gpt-4o-mini", label: "GPT-4o-mini" },
  ],
  gemini: [
    { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
    { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
    { value: "gemini-nano-banana-2", label: "Gemini Nano Banana 2" },
  ],
  claude: [
    { value: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet" },
    { value: "claude-3-haiku", label: "Claude 3 Haiku" },
  ],
  leonardo: [
    { value: "leonardo-v1", label: "Leonardo default" },
  ],
};

const inputClass =
  "w-full rounded-md border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-50 outline-none transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 placeholder:text-zinc-500";

export type QuickStepsContentType = "newsletter" | "blog";
type TemplateId =
  | "none"
  | "productLaunch"
  | "weeklyRecap"
  | "educational"
  | "linkedinImage";

interface NewsletterQuickStepsProps {
  contentType?: QuickStepsContentType;
  templateId?: TemplateId;
  submitting: boolean;
  error?: string | null;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onBackToType: () => void;
}

export function NewsletterQuickSteps({
  contentType = "newsletter",
  templateId = "none",
  submitting,
  error,
  onSubmit,
  onBackToType,
}: NewsletterQuickStepsProps) {
  const headlinePlaceholder =
    contentType === "blog" ? "Blog headline" : "Newsletter headline";
  const descriptionPlaceholder =
    contentType === "blog"
      ? "Brief description of the blog"
      : "Brief description of the newsletter";
  const [step, setStep] = useState<2 | 3 | 4 | 5>(2);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tone, setTone] = useState(TONE_OPTIONS[0].value);
  const [aiProvider, setAiProvider] = useState("gemini");
  const [aiModel, setAiModel] = useState("gemini-1.5-pro");
  const [referenceLinks, setReferenceLinks] = useState("");
  const [mediaRefLinks, setMediaRefLinks] = useState("");
  const [status, setStatus] = useState(STATUS_OPTIONS[0].value);

  // Lightweight template hints – only affect initial placeholders, not required.
  const templateHint =
    templateId === "productLaunch"
      ? "Announce a new product or feature, highlight key benefits, and include a clear call to action."
      : templateId === "weeklyRecap"
        ? "Summarize the most important news from this week for your audience."
        : templateId === "educational"
          ? "Teach your audience a specific concept or workflow step-by-step."
          : templateId === "linkedinImage"
            ? "Short, punchy update suitable for LinkedIn with a strong hook and 2–3 bullet points."
            : "";

  const parseLinks = (text: string): string[] =>
    text
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter((s) => s.startsWith("http"));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      tone,
      aiProvider,
      aiModel,
      referenceLinks: parseLinks(referenceLinks),
      mediaReferenceLinks: parseLinks(mediaRefLinks),
      status,
    });
  };

  const canGoNext =
    (step === 2 && title.trim().length > 0) ||
    (step === 3 && !!aiProvider && !!aiModel) ||
    step === 4;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? (
        <div
          className="rounded-md border border-red-800/60 bg-red-950/40 px-3 py-2 text-sm text-red-200"
          role="alert"
        >
          {error}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {[2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(s as 2 | 3 | 4 | 5)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              step === s
                ? "bg-zinc-100 text-zinc-950"
                : "bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            }`}
          >
            {s - 1}.{" "}
            {s === 2
              ? "Basic Info"
              : s === 3
                ? "AI Settings"
                : s === 4
                  ? "Reference Links"
                  : "Media & Status"}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-6 space-y-4">
        {step === 2 && (
          <>
            <h3 className="text-sm font-medium text-zinc-200">
              2. Basic information
            </h3>
            {templateHint ? (
              <p className="text-xs text-zinc-400">
                Template hint: {templateHint}
              </p>
            ) : null}
            <FormField id="title" label="Title">
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={headlinePlaceholder}
                className={inputClass}
                required
              />
            </FormField>
            <FormField id="description" label="Description">
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={descriptionPlaceholder}
                rows={3}
                className={`${inputClass} resize-y`}
              />
            </FormField>
            <FormField id="tone" label="Tone">
              <select
                id="tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className={inputClass}
              >
                {TONE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </FormField>
          </>
        )}

        {step === 3 && (
          <>
            <h3 className="text-sm font-medium text-zinc-200">AI Settings</h3>
            <FormField id="aiProvider" label="AI Provider">
              <select
                id="aiProvider"
                value={aiProvider}
                onChange={(e) => {
                  setAiProvider(e.target.value);
                  const models = MODELS_BY_PROVIDER[e.target.value];
                  setAiModel(models?.[0]?.value ?? "");
                }}
                className={inputClass}
              >
                {AI_PROVIDERS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField id="aiModel" label="AI Model">
              <select
                id="aiModel"
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className={inputClass}
              >
                {(MODELS_BY_PROVIDER[aiProvider] ?? []).map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </FormField>
          </>
        )}

        {step === 4 && (
          <>
            <h3 className="text-sm font-medium text-zinc-200">
              Reference Links
            </h3>
            <FormField
              id="referenceLinks"
              label="Reference Links"
              hint="One per line or comma-separated"
            >
              <textarea
                id="referenceLinks"
                value={referenceLinks}
                onChange={(e) => setReferenceLinks(e.target.value)}
                placeholder="https://example.com/article"
                rows={4}
                className={`${inputClass} resize-y`}
              />
            </FormField>
          </>
        )}

        {step === 5 && (
          <>
            <h3 className="text-sm font-medium text-zinc-200">
              Media Reference & Status
            </h3>
            <FormField
              id="mediaRefLinks"
              label="Media Reference Links"
              hint="Image/video URLs for reference"
            >
              <textarea
                id="mediaRefLinks"
                value={mediaRefLinks}
                onChange={(e) => setMediaRefLinks(e.target.value)}
                placeholder="https://example.com/image.jpg"
                rows={3}
                className={`${inputClass} resize-y`}
              />
            </FormField>
            <FormField id="status" label="Status">
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={inputClass}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </FormField>
          </>
        )}
      </div>

      <div className="flex justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            if (step === 2) {
              onBackToType();
            } else {
              setStep((prev) => (prev - 1) as 2 | 3 | 4 | 5);
            }
          }}
          className="rounded-md border border-zinc-600 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
        >
          Back
        </button>
        <div className="flex gap-2">
          {step < 5 && (
            <button
              type="button"
              disabled={!canGoNext}
              onClick={() => setStep((prev) => (prev + 1) as 2 | 3 | 4 | 5)}
              className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Next
            </button>
          )}
          {step === 5 && (
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Generating…" : "Generate"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

