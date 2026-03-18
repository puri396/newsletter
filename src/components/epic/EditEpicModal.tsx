"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Modal, Spinner, useToast } from "@/components/ui";
import { FormField } from "@/components/ui/FormField";
import { getApiErrorMessage } from "@/lib/api/get-error-message";

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

type ContentType = "newsletter" | "blog" | "image" | "video";

interface EditEpicModalProps {
  epicId: string;
  open: boolean;
  onClose: () => void;
}

interface LoadEpicResponse {
  data: {
    id: string;
    type: ContentType;
    title: string;
    description: string;
    tone: string | null;
    aiProvider: string | null;
    aiModel: string | null;
    referenceLinks: string[];
    mediaReferenceLinks: string[];
    status: "draft" | "scheduled" | "published" | "archived";
    body: string;
  };
}

export function EditEpicModal({ epicId, open, onClose }: EditEpicModalProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState<ContentType>("newsletter");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tone, setTone] = useState(TONE_OPTIONS[0].value);
  const [aiProvider, setAiProvider] = useState<string>("gemini");
  const [aiModel, setAiModel] = useState<string>("gemini-1.5-pro");
  const [referenceLinksText, setReferenceLinksText] = useState("");
  const [mediaRefLinksText, setMediaRefLinksText] = useState("");
  const [status, setStatus] = useState<string>("draft");
  const [bodyPreview, setBodyPreview] = useState("");

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    const load = async () => {
      setLoadingInitial(true);
      setError(null);
      try {
        const res = await fetch(`/api/epic/content/${epicId}`);
        const json = (await res.json()) as LoadEpicResponse & {
          success?: boolean;
          error?: unknown;
        };
        if (!res.ok) {
          throw new Error(getApiErrorMessage(json, "Failed to load EPIC."));
        }
        if (cancelled) return;
        const d = json.data;

        setType(d.type);
        setTitle(d.title);
        setDescription(d.description ?? "");
        setBodyPreview(d.body ?? "");
        if (d.tone) {
          setTone(d.tone);
        }
        const provider = d.aiProvider ?? "gemini";
        setAiProvider(provider);
        const models = MODELS_BY_PROVIDER[provider] ?? [];
        const modelValue =
          d.aiModel && models.some((m) => m.value === d.aiModel)
            ? d.aiModel
            : models[0]?.value ?? "";
        setAiModel(modelValue);
        setReferenceLinksText((d.referenceLinks ?? []).join("\n"));
        setMediaRefLinksText((d.mediaReferenceLinks ?? []).join("\n"));
        setStatus(
          d.status === "draft" || d.status === "scheduled" || d.status === "published"
            ? d.status
            : "draft",
        );
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Failed to load EPIC content.",
        );
      } finally {
        if (!cancelled) {
          setLoadingInitial(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [epicId, open]);

  const parseLinks = (text: string): string[] =>
    text
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter((s) => s.startsWith("http"));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!type) return;
    setSubmitting(true);
    setError(null);
    try {
      const body = {
        type,
        title: title.trim(),
        description: description.trim(),
        tone,
        aiProvider,
        aiModel,
        referenceLinks: parseLinks(referenceLinksText),
        mediaReferenceLinks: parseLinks(mediaRefLinksText),
        status,
      };
      const res = await fetch(`/api/epic/content/${epicId}/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as {
        data?: { id: string };
        success?: boolean;
        error?: unknown;
      };
      if (!res.ok) {
        throw new Error(
          getApiErrorMessage(
            json as { success?: boolean; error?: unknown },
            "Failed to regenerate EPIC content.",
          ),
        );
      }
      addToast("Content regenerated successfully!", "success");
      onClose();
      router.push(`/epic/edit/${epicId}`);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to regenerate EPIC content.";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit & Regenerate EPIC"
      maxWidth="xl"
    >
      {loadingInitial ? (
        <div className="flex items-center justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-zinc-400">
            Update the settings below, then ask AI to generate a fresh version
            of this content. The old version will be replaced on the edit page.
          </p>

          {error ? (
            <div className="rounded-md border border-red-800/60 bg-red-950/40 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <FormField id="type" label="Type">
              <select
                id="type"
                value={type}
                disabled
                className={`${inputClass} cursor-not-allowed bg-zinc-900/60 text-zinc-400`}
              >
                <option value="newsletter">Newsletter</option>
                <option value="blog">Blog</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
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
          </div>

          <FormField id="title" label="Title">
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Content title"
              className={inputClass}
              required
            />
          </FormField>

          <FormField id="description" label="Description">
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description that guides regeneration"
              rows={3}
              className={`${inputClass} resize-y`}
            />
          </FormField>

          <div className="grid gap-4 md:grid-cols-2">
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

            <FormField
              id="aiProvider"
              label="AI Provider"
              hint="If you're not sure, keep the default. Claude options may not be available in every workspace."
            >
              <select
                id="aiProvider"
                value={aiProvider}
                onChange={(e) => {
                  const provider = e.target.value;
                  setAiProvider(provider);
                  const models = MODELS_BY_PROVIDER[provider] ?? [];
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
          </div>

          <FormField
            id="aiModel"
            label="AI Model"
            hint="Pick a model that matches your provider, or keep the suggested default."
          >
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

          <FormField
            id="referenceLinks"
            label="Reference Links"
            hint="One per line or comma-separated"
          >
            <textarea
              id="referenceLinks"
              value={referenceLinksText}
              onChange={(e) => setReferenceLinksText(e.target.value)}
              placeholder="https://example.com/article"
              rows={3}
              className={`${inputClass} resize-y`}
            />
          </FormField>

          <FormField
            id="mediaRefLinks"
            label="Media Reference Links"
            hint="Image/video URLs for reference"
          >
            <textarea
              id="mediaRefLinks"
              value={mediaRefLinksText}
              onChange={(e) => setMediaRefLinksText(e.target.value)}
              placeholder="https://example.com/image-or-video"
              rows={3}
              className={`${inputClass} resize-y`}
            />
          </FormField>

          <FormField
            id="currentBody"
            label="Current Content (read-only)"
            hint="This is the existing content. When you generate a new draft, it will be fully replaced on the edit page."
          >
            <div className="max-h-64 overflow-y-auto rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-100 whitespace-pre-wrap">
              {bodyPreview || "—"}
            </div>
          </FormField>

          <div className="flex justify-between gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 justify-center rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Spinner size="sm" className="border-zinc-400 border-t-zinc-800" />
                  Generating…
                </>
              ) : (
                "Generate new draft"
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

