"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, useToast } from "@/components/ui";
import { FormField } from "@/components/ui/FormField";
import { CreateContentForm, type ContentType } from "./CreateContentForm";
import { NewsletterQuickSteps } from "./newsletter/NewsletterQuickSteps";

const inputClass =
  "w-full rounded-md border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-50 outline-none transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500";

const CONTENT_TYPES: { value: ContentType; label: string; helper: string }[] = [
  {
    value: "newsletter",
    label: "Newsletter",
    helper: "Email newsletter with subject, body, and key takeaways.",
  },
  {
    value: "blog",
    label: "Blog post",
    helper: "Longer-form article tailored to your audience.",
  },
  {
    value: "image",
    label: "Image",
    helper: "Single AI-generated image plus caption ideas.",
  },
  {
    value: "video",
    label: "Video script",
    helper: "Short script and prompts for video content.",
  },
];

type TemplateId =
  | "none"
  | "productLaunch"
  | "weeklyRecap"
  | "educational"
  | "linkedinImage";

interface TemplateMeta {
  id: TemplateId;
  label: string;
  description: string;
}

const TEMPLATES: TemplateMeta[] = [
  {
    id: "none",
    label: "Blank",
    description: "Start from a blank prompt.",
  },
  {
    id: "productLaunch",
    label: "Product launch announcement",
    description: "Announce a new feature or product to your audience.",
  },
  {
    id: "weeklyRecap",
    label: "Weekly industry recap",
    description: "Summarize key stories from the week.",
  },
  {
    id: "educational",
    label: "Educational deep-dive",
    description: "Teach your audience something new step by step.",
  },
  {
    id: "linkedinImage",
    label: "LinkedIn image post",
    description: "Short, visual update for social feeds.",
  },
];

interface CreateContentModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateContentModal({
  open,
  onClose,
  onCreated,
}: CreateContentModalProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState<TemplateId>("none");

  const handleSubmit = async (data: Record<string, unknown>) => {
    setSubmitting(true);
    setError(null);
    try {
      if (!contentType) {
        throw new Error("Select a content type first.");
      }

      const res = await fetch("/api/epic/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: contentType,
          title: data.title,
          description: data.description,
          tone: data.tone,
          aiProvider: data.aiProvider,
          aiModel: data.aiModel,
          referenceLinks: data.referenceLinks,
          mediaReferenceLinks: data.mediaRefLinks ?? data.mediaReferenceLinks,
          status: (data.status as string) || "draft",
        }),
      });

      let json: {
        data?: { id?: string };
        success?: boolean;
        error?: { message?: string };
      };
      try {
        json = (await res.json()) as typeof json;
      } catch {
        json = {};
      }

      if (!res.ok) {
        const msg =
          json?.error?.message ??
          (res.status === 401
            ? "Unauthorized. Check that the admin secret is configured correctly."
            : "Failed to generate content. Please try again.");
        throw new Error(msg);
      }

      if (!json?.data?.id) {
        throw new Error(
          json?.error?.message ?? "Failed to generate content. Please try again.",
        );
      }

      addToast("Content generated successfully!", "success");
      onCreated();
      onClose();
      router.push(`/epic/view/${json.data.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to generate content";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setContentType(null);
      setTemplateId("none");
      setStep(1);
      setSubmitting(false);
      setError(null);
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New content"
      maxWidth="xl"
    >
      <div className="space-y-6">
        {step === 1 && (
          <section>
            <h3 className="mb-3 text-sm font-medium text-zinc-200">
              1. Choose what you want to create
            </h3>
            <FormField id="type" label="Content type">
              <select
                id="type"
                value={contentType ?? ""}
                onChange={(e) =>
                  setContentType(e.target.value as ContentType)
                }
                className={inputClass}
              >
                <option value="" disabled>
                  Select a content type
                </option>
                {CONTENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </FormField>
            {contentType ? (
              <p className="mt-2 text-xs text-zinc-400">
                {
                  CONTENT_TYPES.find((t) => t.value === contentType)
                    ?.helper
                }
              </p>
            ) : (
              <p className="mt-2 text-xs text-zinc-500">
                Select a content type to see what EPIC will generate.
              </p>
            )}
            <div className="mt-4">
              <FormField id="template" label="Template (optional)">
                <select
                  id="template"
                  value={templateId}
                  onChange={(e) =>
                    setTemplateId(e.target.value as TemplateId)
                  }
                  className={inputClass}
                >
                  {TEMPLATES.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.label}
                    </option>
                  ))}
                </select>
              </FormField>
              <p className="mt-1 text-[11px] text-zinc-500">
                Templates only pre-fill suggestions in the next step. You can
                still edit everything before generating content.
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                disabled={!contentType}
                onClick={() => setStep(2)}
                className="inline-flex items-center rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Next
              </button>
            </div>
          </section>
        )}

        {step >= 2 && (contentType === "newsletter" || contentType === "blog") && (
          <section>
            <NewsletterQuickSteps
              contentType={contentType === "blog" ? "blog" : "newsletter"}
              templateId={templateId}
              submitting={submitting}
              error={error}
              onBackToType={() => {
                setStep(1);
              }}
              onSubmit={handleSubmit}
            />
          </section>
        )}

        {step >= 2 && contentType && contentType !== "newsletter" && contentType !== "blog" && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-zinc-200">
                {contentType.charAt(0).toUpperCase() + contentType.slice(1)}{" "}
                Details
              </h3>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-zinc-400 hover:text-zinc-100"
              >
                Back to type
              </button>
            </div>
            <CreateContentForm
              contentType={contentType}
              onSubmit={handleSubmit}
              submitting={submitting}
              error={error}
            />
          </section>
        )}
      </div>
    </Modal>
  );
}

function mapProviderForEpic(provider: string): string {
  if (provider === "openai") return "chatgpt";
  return provider;
}
