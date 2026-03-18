"use client";

import { useState, type FormEvent } from "react";
import { FormField } from "@/components/ui/FormField";
import type { GenerateNewsletterOutput } from "@/lib/ai/types";
import type { WorkflowStep } from "./CreateNewsletterWorkflow";

const TONE_OPTIONS = [
  { value: "friendly", label: "Friendly" },
  { value: "professional", label: "Professional" },
  { value: "technical", label: "Technical" },
  { value: "marketing", label: "Marketing" },
  { value: "informative", label: "Informative" },
] as const;

const AI_PROVIDERS = [
  { value: "openai", label: "OpenAI" },
  { value: "gemini", label: "Google Gemini" },
  { value: "claude", label: "Anthropic Claude" },
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
};

const inputClass =
  "w-full rounded-md border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-50 outline-none transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 placeholder:text-zinc-500";

interface CreateNewsletterStepsProps {
  step: WorkflowStep;
  onStepChange: (step: WorkflowStep) => void;
  onGenerated: (result: GenerateNewsletterOutput) => void;
  generating: boolean;
  setGenerating: (v: boolean) => void;
}

export function CreateNewsletterSteps({
  step,
  onStepChange,
  onGenerated,
  generating,
  setGenerating,
}: CreateNewsletterStepsProps) {
  const [title, setTitle] = useState("");
  const [tone, setTone] = useState(TONE_OPTIONS[0].value);
  const [targetAudience, setTargetAudience] = useState("");
  const [topic, setTopic] = useState("");
  const [aiProvider, setAiProvider] = useState("gemini");
  const [aiModel, setAiModel] = useState("gemini-1.5-pro");
  const [referenceLinks, setReferenceLinks] = useState("");
  const [imageRefLinks, setImageRefLinks] = useState("");
  const [videoRefLinks, setVideoRefLinks] = useState("");

  const parseLinks = (text: string): string[] =>
    text
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter((s) => s.startsWith("http"));

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || undefined,
          topic: topic.trim() || "Newsletter topic",
          tone,
          targetAudience: targetAudience.trim() || "General audience",
          referenceLinks: parseLinks(referenceLinks),
          imageReferenceLinks: parseLinks(imageRefLinks),
          videoReferenceLinks: parseLinks(videoRefLinks),
          aiProvider,
          aiModel,
        }),
      });
      const data = (await res.json()) as GenerateNewsletterOutput & {
        error?: { message?: string };
      };
      if (!res.ok) {
        throw new Error(
          (data as { error?: { message?: string } }).error?.message ??
            "Failed to generate"
        );
      }
      onGenerated({
        title: data.title ?? "Untitled",
        description: data.description ?? "",
        body: data.body ?? "",
        keyPoints: data.keyPoints ?? [],
        suggestedImages: data.suggestedImages,
        suggestedVideos: data.suggestedVideos,
        videoPrompts: data.videoPrompts,
        generatedImages: data.generatedImages,
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to generate newsletter");
    } finally {
      setGenerating(false);
    }
  };

  const steps = [
    { num: 1, label: "Basic Info" },
    { num: 2, label: "AI Provider & Model" },
    { num: 3, label: "Reference Links" },
    { num: 4, label: "Media Reference" },
    { num: 5, label: "Generate" },
  ];

  return (
    <form onSubmit={handleGenerate} className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {steps.map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => onStepChange(s.num as WorkflowStep)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              step === s.num
                ? "bg-zinc-100 text-zinc-950"
                : "bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            }`}
          >
            {s.num}. {s.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-6">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-200">Basic Info</h3>
            <FormField id="title" label="Title">
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Newsletter headline"
                className={inputClass}
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
            <FormField id="audience" label="Target Audience">
              <input
                id="audience"
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. Small business owners, marketers"
                className={inputClass}
              />
            </FormField>
            <FormField id="topic" label="Description / Topic">
              <textarea
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder='e.g. "AI tools for small businesses"'
                rows={4}
                className={`${inputClass} resize-y`}
              />
            </FormField>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-200">
              AI Provider & Model
            </h3>
            <FormField id="provider" label="AI Provider">
              <select
                id="provider"
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
            <FormField id="model" label="Model">
              <select
                id="model"
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
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-200">
              Reference Links (Optional)
            </h3>
            <FormField
              id="ref-links"
              label="Links"
              hint="One per line or comma-separated"
            >
              <textarea
                id="ref-links"
                value={referenceLinks}
                onChange={(e) => setReferenceLinks(e.target.value)}
                placeholder="https://example.com/article-1"
                rows={5}
                className={`${inputClass} resize-y`}
              />
            </FormField>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-200">
              Media Reference (Optional)
            </h3>
            <FormField id="image-refs" label="Image Reference Links">
              <textarea
                id="image-refs"
                value={imageRefLinks}
                onChange={(e) => setImageRefLinks(e.target.value)}
                placeholder="https://example.com/image1.jpg"
                rows={3}
                className={`${inputClass} resize-y`}
              />
            </FormField>
            <FormField id="video-refs" label="Video Reference Links">
              <textarea
                id="video-refs"
                value={videoRefLinks}
                onChange={(e) => setVideoRefLinks(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                rows={3}
                className={`${inputClass} resize-y`}
              />
            </FormField>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-200">
              Generate Newsletter
            </h3>
            <p className="text-sm text-zinc-400">
              Click below to send your inputs to AI and generate a newsletter
              draft.
            </p>
            <button
              type="submit"
              disabled={generating}
              className="inline-flex items-center justify-center rounded-md bg-zinc-100 px-6 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generating ? "Generating…" : "Generate Newsletter"}
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {step > 1 && step < 6 && (
          <button
            type="button"
            onClick={() => onStepChange((step - 1) as WorkflowStep)}
            className="rounded-md border border-zinc-600 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
          >
            Back
          </button>
        )}
        {step < 5 && (
          <button
            type="button"
            onClick={() => onStepChange((step + 1) as WorkflowStep)}
            className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200"
          >
            Next
          </button>
        )}
      </div>
    </form>
  );
}
