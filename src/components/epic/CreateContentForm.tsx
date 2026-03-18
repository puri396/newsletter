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

export type ContentType = "newsletter" | "blog" | "image" | "video";

interface CreateContentFormProps {
  contentType: ContentType;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  submitting: boolean;
  error?: string | null;
}

export function CreateContentForm({
  contentType,
  onSubmit,
  submitting,
  error,
}: CreateContentFormProps) {
  const [title, setTitle] = useState("");
  const [tone, setTone] = useState(TONE_OPTIONS[0].value);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(STATUS_OPTIONS[0].value);
  const [aiProvider, setAiProvider] = useState("gemini");
  const [aiModel, setAiModel] = useState("gemini-1.5-pro");
  const [referenceLinks, setReferenceLinks] = useState("");
  const [mediaRefLinks, setMediaRefLinks] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  const parseLinks = (text: string): string[] =>
    text
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter((s) => s.startsWith("http"));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload: Record<string, unknown> = {
      title: title.trim(),
      tone,
      description: description.trim(),
      status,
      referenceLinks: parseLinks(referenceLinks),
      mediaRefLinks: parseLinks(mediaRefLinks),
      imageUrl: imageUrl.trim() || undefined,
      thumbnailUrl: thumbnailUrl.trim() || undefined,
    };

    // Only send AI provider/model for non-image content types.
    if (contentType !== "image") {
      payload.aiProvider = aiProvider;
      payload.aiModel = aiModel;
    }

    await onSubmit(payload);
  };

  const showTone = true;
  const showReferenceLinks = true;
  const showMediaRefLinks = true;
  const showAiSettings = contentType !== "image";
  const showImageUrl = contentType === "image";
  const showThumbnailUrl = contentType === "video";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? (
        <div className="rounded-md border border-red-800/60 bg-red-950/40 px-3 py-2 text-xs text-red-200">
          {error}
        </div>
      ) : null}
      <FormField id="title" label="Title">
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={
            contentType === "newsletter"
              ? "Newsletter headline"
              : contentType === "blog"
                ? "Blog title"
                : contentType === "image"
                  ? "Image title"
                  : "Video title"
          }
          className={inputClass}
          required
        />
      </FormField>

      {showTone && (
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
      )}

      <FormField id="description" label="Description">
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the content"
          rows={3}
          className={`${inputClass} resize-y`}
        />
      </FormField>

      {showAiSettings && (
        <>
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

      {showReferenceLinks && (
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
            rows={3}
            className={`${inputClass} resize-y`}
          />
        </FormField>
      )}

      {showMediaRefLinks && (
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
            rows={2}
            className={`${inputClass} resize-y`}
          />
        </FormField>
      )}

      {showImageUrl && (
        <FormField id="imageUrl" label="Image URL" hint="Optional">
          <input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className={inputClass}
          />
        </FormField>
      )}

      {showThumbnailUrl && (
        <FormField id="thumbnailUrl" label="Thumbnail URL" hint="Optional">
          <input
            id="thumbnailUrl"
            type="url"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            placeholder="https://example.com/thumbnail.jpg"
            className={inputClass}
          />
        </FormField>
      )}

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

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Generating…" : "Generate"}
        </button>
      </div>
    </form>
  );
}
