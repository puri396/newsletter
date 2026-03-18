"use client";

import { useState, type FormEvent } from "react";
import type { NewsletterStatus } from "@/prisma-client/enums";
import type { GenerateNewsletterOutput } from "@/lib/ai/types";
import { getApiErrorMessage } from "@/lib/api/get-error-message";

const inputClass =
  "w-full rounded-md border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-50 outline-none transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 placeholder:text-zinc-500";

interface NewsletterDraftEditorProps {
  draft: GenerateNewsletterOutput;
  onBack: () => void;
}

export function NewsletterDraftEditor({ draft, onBack }: NewsletterDraftEditorProps) {
  const [title, setTitle] = useState(draft.title);
  const [description, setDescription] = useState(draft.description);
  const [body, setBody] = useState(draft.body);
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [status, setStatus] = useState<NewsletterStatus>("draft");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [socialShare, setSocialShare] = useState({
    linkedin: false,
    twitter: false,
    facebook: false,
    email: false,
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const handleSocialChange = (key: keyof typeof socialShare, checked: boolean) => {
    setSocialShare((prev) => ({ ...prev, [key]: checked }));
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(null);
    setSaving(true);
    try {
      const res = await fetch("/api/newsletters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: title.trim(),
          description: description.trim() || undefined,
          body: body.trim(),
          status,
          tags: [],
        }),
      });
      const data = (await res.json()) as { data?: { id: string }; error?: { message?: string } };
      if (!res.ok) {
        setSaveError(getApiErrorMessage(data, "Failed to save."));
        return;
      }
      if (status === "scheduled" && scheduleDate && data.data?.id) {
        const sendAt = new Date(`${scheduleDate}T${scheduleTime}`);
        await fetch(`/api/newsletters/${data.data.id}/schedule`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sendAt: sendAt.toISOString() }),
        });
      }
      setSaveSuccess("Saved successfully.");
    } catch {
      setSaveError("Unable to reach the server.");
    } finally {
      setSaving(false);
    }
  };

  const saveLabel =
    status === "draft"
      ? "Save as Draft"
      : status === "scheduled"
        ? "Schedule"
        : "Publish Now";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-50">
            Newsletter Draft Preview
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Edit and publish your newsletter.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-zinc-600 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
        >
          Back to workflow
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Newsletter Preview - how it will look */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-6">
          <p className="mb-3 text-xs font-medium text-zinc-400">
            Newsletter Preview
          </p>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
            {(draft.suggestedImages?.length ?? 0) > 0 &&
            (draft.suggestedImages![0].startsWith("http") ||
              draft.suggestedImages![0].startsWith("data:")) ? (
              <img
                src={draft.suggestedImages![0]}
                alt=""
                className="mb-4 w-full rounded-md object-cover"
                style={{ maxHeight: "240px" }}
              />
            ) : null}
            <h3 className="text-lg font-semibold text-zinc-50">{title}</h3>
            {description && (
              <p className="mt-1 text-sm text-zinc-400">{description}</p>
            )}
            <div className="mt-4 whitespace-pre-wrap text-sm text-zinc-200">
              {body.slice(0, 300)}
              {body.length > 300 ? "…" : ""}
            </div>
            {(draft.suggestedVideos?.length ?? 0) > 0 && (
              <div className="mt-4 border-t border-zinc-800 pt-4">
                <p className="text-xs font-medium text-zinc-500 mb-2">
                  Videos
                </p>
                <ul className="space-y-1 text-xs text-zinc-400">
                  {draft.suggestedVideos.map((v, i) => (
                    <li key={i}>
                      {v.startsWith("http") || v.startsWith("www.") ? (
                        <a
                          href={
                            v.startsWith("http") ? v : `https://${v}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          {v}
                        </a>
                      ) : (
                        v
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {draft.videoPrompts && draft.videoPrompts.length > 0 && (
              <div className="mt-4 border-t border-zinc-800 pt-4">
                <p className="text-xs font-medium text-zinc-500 mb-2">
                  Video ideas
                </p>
                <ul className="space-y-1 text-xs text-zinc-400">
                  {draft.videoPrompts.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Description / Summary
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className={`${inputClass} resize-y`}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Content Body
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              className={`${inputClass} resize-y`}
            />
          </div>

          {draft.keyPoints && draft.keyPoints.length > 0 && (
            <div className="rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
              <p className="text-xs font-medium text-zinc-400 mb-2">
                Key points (from AI)
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-zinc-300">
                {draft.keyPoints.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          {(draft.suggestedImages?.length ?? 0) > 0 && (
            <div className="rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
              <p className="text-xs font-medium text-zinc-400 mb-2">
                Generated & Suggested Images
              </p>
              <div className="flex flex-wrap gap-2">
                {draft.suggestedImages!.map((url, i) => {
                  const isImageUrl =
                    url.startsWith("http") || url.startsWith("data:");
                  return isImageUrl ? (
                    <img
                      key={i}
                      src={url}
                      alt=""
                      className="h-24 w-24 rounded object-cover border border-zinc-700"
                    />
                  ) : (
                    <span
                      key={i}
                      className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-300"
                    >
                      {url}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {((draft.suggestedVideos?.length ?? 0) > 0 ||
            (draft.videoPrompts?.length ?? 0) > 0) && (
            <div className="rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
              <p className="text-xs font-medium text-zinc-400 mb-2">
                Suggested Videos
              </p>
              <ul className="space-y-1">
                {(draft.suggestedVideos ?? []).map((item, i) => {
                  const isUrl =
                    item.startsWith("http") || item.startsWith("www.");
                  return (
                    <li key={i}>
                      {isUrl ? (
                        <a
                          href={
                            item.startsWith("http") ? item : `https://${item}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-zinc-300 hover:text-zinc-100 underline"
                        >
                          {item}
                        </a>
                      ) : (
                        <span className="text-sm text-zinc-300">{item}</span>
                      )}
                    </li>
                  );
                })}
                {draft.videoPrompts?.map(
                  (prompt, i) => (
                    <li key={`vp-${i}`} className="text-sm text-zinc-400">
                      Video idea: {prompt}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                CTA Button Label
              </label>
              <input
                type="text"
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                placeholder="e.g. Learn More"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                CTA URL
              </label>
              <input
                type="url"
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="https://..."
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-zinc-300 mb-2">
              Social Sharing
            </p>
            <div className="flex flex-wrap gap-4">
              {(["linkedin", "twitter", "facebook", "email"] as const).map(
                (key) => (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={socialShare[key]}
                      onChange={(e) =>
                        handleSocialChange(key, e.target.checked)
                      }
                      className="rounded border-zinc-600"
                    />
                    <span className="capitalize">{key}</span>
                  </label>
                )
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-6">
          <h3 className="text-sm font-medium text-zinc-200 mb-4">
            Publishing Controls
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as NewsletterStatus)
                }
                className={inputClass}
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Public</option>
              </select>
            </div>

            {status === "scheduled" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-md bg-zinc-100 px-6 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200 disabled:opacity-60"
              >
                {saving ? "Saving…" : saveLabel}
              </button>
              <div className="text-xs">
                {saveError && (
                  <span className="text-red-400">{saveError}</span>
                )}
                {saveSuccess && (
                  <span className="text-emerald-400">{saveSuccess}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
