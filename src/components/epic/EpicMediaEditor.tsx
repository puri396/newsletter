"use client";

import { useState, type FormEvent } from "react";
import { getApiErrorMessage } from "@/lib/api/get-error-message";
import { StatusBadge } from "@/components/ui/StatusBadge";

const inputClass =
  "w-full rounded-md border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-50 outline-none transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 placeholder:text-zinc-500";

interface EpicMediaEditorProps {
  newsletterId: string;
  subject: string;
  description: string | null;
  body: string;
  status: string;
  contentType: "image" | "video";
  bannerImageUrl: string | null;
  epicMetadata: {
    tone?: string;
    aiProvider?: string;
    referenceLinks?: string[];
    mediaReferenceLinks?: string[];
    keyPoints?: string[];
    hashtags?: string[];
  };
}

export function EpicMediaEditor({
  newsletterId,
  subject,
  description,
  body,
  status,
  contentType,
  bannerImageUrl,
  epicMetadata,
}: EpicMediaEditorProps) {
  const [titleValue, setTitleValue] = useState(subject);
  const [descriptionValue, setDescriptionValue] = useState(description ?? "");
  const [bodyValue, setBodyValue] = useState(body);
  const [imageUrlValue, setImageUrlValue] = useState(bannerImageUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const referenceLinks = epicMetadata.referenceLinks ?? [];
  const mediaReferenceLinks = epicMetadata.mediaReferenceLinks ?? [];
  const keyPoints = epicMetadata.keyPoints ?? [];
  const hashtags = epicMetadata.hashtags ?? [];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedMessage(null);
    try {
      const res = await fetch(`/api/newsletters/${newsletterId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: titleValue.trim(),
          description: descriptionValue.trim(),
          body: bodyValue.trim(),
          bannerImageUrl:
            contentType === "image" && imageUrlValue.trim()
              ? imageUrlValue.trim()
              : contentType === "image"
                ? null
                : undefined,
        }),
      });
      const json = (await res.json()) as {
        success?: boolean;
        error?: string | { code?: string; message?: string };
      };
      if (!res.ok) {
        throw new Error(
          getApiErrorMessage(json, "Failed to save EPIC content."),
        );
      }
      setSavedMessage("Changes saved.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save EPIC content.",
      );
    } finally {
      setSaving(false);
    }
  };

  const contentTypeLabel =
    contentType.charAt(0).toUpperCase() + contentType.slice(1);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 lg:p-5"
    >
      {error ? (
        <div className="rounded-md border border-red-800/60 bg-red-950/40 px-3 py-2 text-xs text-red-200">
          {error}
        </div>
      ) : null}
      {savedMessage ? (
        <div className="rounded-md border border-emerald-800/60 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-200">
          {savedMessage}
        </div>
      ) : null}

      <div className="rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-xs text-zinc-300">
        <p>
          This page is for manual tweaks to your {contentType} content. To ask
          AI for a fresh take, use the <span className="font-medium">Edit</span>{" "}
          action in the EPIC list and run regeneration from there.
        </p>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div>
            <label
              htmlFor="epic-title"
              className="mb-1 block text-xs font-medium text-zinc-400"
            >
              Title
            </label>
            <input
              id="epic-title"
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label
              htmlFor="epic-description"
              className="mb-1 block text-xs font-medium text-zinc-400"
            >
              Description
            </label>
            <textarea
              id="epic-description"
              value={descriptionValue}
              onChange={(e) => setDescriptionValue(e.target.value)}
              rows={3}
              className={`${inputClass} resize-y`}
              placeholder="Short description for this EPIC content"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <StatusBadge status={status} />
            <span className="inline-flex items-center rounded-full border border-zinc-700 px-2 py-0.5 text-[11px] uppercase tracking-wide text-zinc-300">
              {contentTypeLabel}
            </span>
          </div>
        </div>
      </div>

      {contentType === "image" && (
        <div>
          <label
            htmlFor="epic-image-url"
            className="mb-1 block text-xs font-medium text-zinc-400"
          >
            Image URL
          </label>
          <input
            id="epic-image-url"
            type="url"
            value={imageUrlValue}
            onChange={(e) => setImageUrlValue(e.target.value)}
            className={inputClass}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      )}

      {contentType === "image" && imageUrlValue && (
        <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrlValue}
            alt={titleValue}
            className=""
          />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
          <p className="text-xs font-medium text-zinc-400">Content</p>
          <textarea
            id="epic-body"
            value={bodyValue}
            onChange={(e) => setBodyValue(e.target.value)}
            rows={10}
            className={`${inputClass} min-h-[160px] resize-y`}
            placeholder="Main content for this EPIC item"
          />
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-xs text-zinc-300">
            <p className="mb-2 font-medium text-zinc-200">Metadata</p>
            <dl className="space-y-1.5">
              {epicMetadata.tone ? (
                <div className="flex justify-between gap-2">
                  <dt className="text-zinc-500">Tone</dt>
                  <dd className="text-zinc-200">{epicMetadata.tone}</dd>
                </div>
              ) : null}
              {epicMetadata.aiProvider ? (
                <div className="flex justify-between gap-2">
                  <dt className="text-zinc-500">AI Provider</dt>
                  <dd className="text-zinc-200">
                    {epicMetadata.aiProvider}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>

          {referenceLinks.length > 0 ? (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-xs text-zinc-300">
              <p className="mb-2 font-medium text-zinc-200">Reference Links</p>
              <ul className="space-y-1.5">
                {referenceLinks.map((url) => (
                  <li key={url} className="truncate">
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-300 underline-offset-2 hover:underline"
                    >
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {mediaReferenceLinks.length > 0 ? (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-xs text-zinc-300">
              <p className="mb-2 font-medium text-zinc-200">
                Media References
              </p>
              <ul className="space-y-1.5">
                {mediaReferenceLinks.map((url) => (
                  <li key={url} className="truncate">
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-300 underline-offset-2 hover:underline"
                    >
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {hashtags.length > 0 ? (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-xs text-zinc-300">
              <p className="mb-2 font-medium text-zinc-200">Hashtags</p>
              <div className="flex flex-wrap gap-1">
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-100"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {keyPoints.length > 0 ? (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-xs text-zinc-300">
              <p className="mb-2 font-medium text-zinc-200">Key Points</p>
              <ul className="list-disc space-y-1 pl-4">
                {keyPoints.map((point, idx) => (
                  <li key={`${point}-${idx}`}>{point}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

