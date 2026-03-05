'use client';

import { useMemo, useState, type FormEvent } from 'react';
import type { NewsletterStatus } from '@/prisma-client/enums';
import { getApiErrorMessage } from '@/lib/api/get-error-message';

interface NewsletterEditorProps {
  initialValues?: Partial<NewsletterFormValues> & {
    newsletterId?: string;
    bannerImageUrl?: string | null;
  };
  onSaved?: (newsletter: ApiNewsletter) => void;
}

interface NewsletterFormValues {
  title: string;
  description: string;
  body: string;
  tagsInput: string;
  status: NewsletterStatus;
}

interface NewsletterFormErrors {
  title?: string;
  body?: string;
}

interface ApiNewsletter {
  id: string;
  subject: string;
  description: string | null;
  body: string;
  status: NewsletterStatus;
  tags: string[];
  bannerImageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CreateNewsletterResponse {
  data?: ApiNewsletter;
  error?: string;
}

/** Response shape from POST /api/ai/generate-newsletter */
interface GenerateNewsletterResponse {
  title: string;
  description: string;
  body: string;
  keyPoints: string[];
}

const TONE_OPTIONS = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "technical", label: "Technical" },
  { value: "casual", label: "Casual" },
  { value: "inspirational", label: "Inspirational" },
] as const;

export function NewsletterEditor({
  initialValues,
  onSaved,
}: NewsletterEditorProps) {
  const [values, setValues] = useState<NewsletterFormValues>(() => ({
    title: initialValues?.title ?? '',
    description: initialValues?.description ?? '',
    body: initialValues?.body ?? '',
    tagsInput: initialValues?.tagsInput ?? '',
    status: initialValues?.status ?? 'draft',
  }));

  const [errors, setErrors] = useState<NewsletterFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>(
    'desktop',
  );

  const [aiTopic, setAiTopic] = useState('');
  const [aiTone, setAiTone] = useState<string>(TONE_OPTIONS[0].value);
  const [aiTargetAudience, setAiTargetAudience] = useState('');
  const [aiReferenceLinks, setAiReferenceLinks] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [keyPoints, setKeyPoints] = useState<string[]>([]);

  const [lastSavedId, setLastSavedId] = useState<string | null>(
    initialValues?.newsletterId ?? null,
  );
  const [bannerImageUrl, setBannerImageUrl] = useState<string | null>(
    initialValues?.bannerImageUrl ?? null,
  );
  const [bannerPrompt, setBannerPrompt] = useState('');
  const [generatingBanner, setGeneratingBanner] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);

  const parsedTags = useMemo(() => {
    if (!values.tagsInput.trim()) return [];

    return Array.from(
      new Set(
        values.tagsInput
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
      ),
    );
  }, [values.tagsInput]);

  const hasErrors = useMemo(
    () => Boolean(errors.title || errors.body),
    [errors],
  );

  function handleChange<K extends keyof NewsletterFormValues>(
    key: K,
    nextValue: NewsletterFormValues[K],
  ) {
    setValues((prev) => ({
      ...prev,
      [key]: nextValue,
    }));

    if (key === 'title' && errors.title) {
      setErrors((prev) => ({ ...prev, title: undefined }));
    }

    if (key === 'body' && errors.body) {
      setErrors((prev) => ({ ...prev, body: undefined }));
    }
  }

  function validate(): boolean {
    const nextErrors: NewsletterFormErrors = {};

    if (!values.title.trim()) {
      nextErrors.title = 'Title is required.';
    }

    if (!values.body.trim()) {
      nextErrors.body = 'Body is required.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaveError(null);
    setSaveSuccess(null);

    const isValid = validate();
    if (!isValid) return;

    setSaving(true);

    const existingId = lastSavedId ?? initialValues?.newsletterId;

    try {
      const payload = {
        subject: values.title.trim(),
        description: values.description.trim() || undefined,
        body: values.body.trim(),
        status: values.status,
        tags: parsedTags,
      };
      const url = existingId
        ? `/api/newsletters/${existingId}`
        : '/api/newsletters';
      const method = existingId ? 'PATCH' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = (await response.json()) as CreateNewsletterResponse & { data?: ApiNewsletter };

      if (!response.ok) {
        setSaveError(getApiErrorMessage(json, 'Failed to save draft.'));
        return;
      }

      if (!json.data) {
        setSaveError('Unexpected response from server.');
        return;
      }

      setLastSavedId(json.data.id);
      if (json.data.bannerImageUrl !== undefined) {
        setBannerImageUrl(json.data.bannerImageUrl ?? null);
      }
      setSaveSuccess(existingId ? 'Draft updated.' : 'Draft saved successfully.');
      onSaved?.(json.data);
    } catch (error) {
      setSaveError('Unable to reach the server. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerateDraft() {
    setGenerateError(null);
    const topic = aiTopic.trim();
    const tone = aiTone.trim();
    const targetAudience = aiTargetAudience.trim();
    if (!topic || !tone || !targetAudience) {
      setGenerateError('Topic, tone, and target audience are required.');
      return;
    }
    setGenerating(true);
    try {
      const referenceLinks = aiReferenceLinks
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean);
      const response = await fetch('/api/ai/generate-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          tone,
          targetAudience,
          referenceLinks: referenceLinks.length > 0 ? referenceLinks : undefined,
        }),
      });
      const json = (await response.json()) as GenerateNewsletterResponse & {
        error?: string;
      };
      if (!response.ok) {
        setGenerateError(getApiErrorMessage(json, 'Failed to generate draft.'));
        return;
      }
      setValues((prev) => ({
        ...prev,
        title: json.title ?? prev.title,
        description: json.description ?? prev.description,
        body: json.body ?? prev.body,
      }));
      setKeyPoints(Array.isArray(json.keyPoints) ? json.keyPoints : []);
    } catch {
      setGenerateError('Unable to reach the server. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  async function handleGenerateBanner() {
    const id = lastSavedId ?? initialValues?.newsletterId;
    if (!id) {
      setBannerError('Save the draft first to generate a banner image.');
      return;
    }
    const prompt = bannerPrompt.trim() || `${values.title.trim()}. ${values.description.trim() || values.body.slice(0, 200)}`;
    if (!prompt) {
      setBannerError('Enter a prompt or add a title/description to derive one.');
      return;
    }
    setBannerError(null);
    setGeneratingBanner(true);
    try {
      const res = await fetch('/api/ai/generate-banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = (await res.json()) as { url?: string };
      if (!res.ok) {
        setBannerError(getApiErrorMessage(data, 'Failed to generate banner.'));
        return;
      }
      const url = data.url;
      if (typeof url !== 'string') {
        setBannerError('No image URL returned.');
        return;
      }
      const patchRes = await fetch(`/api/newsletters/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bannerImageUrl: url }),
      });
      if (!patchRes.ok) {
        setBannerImageUrl(url);
        setBannerError('Banner generated but failed to save. You can try saving the draft again.');
        return;
      }
      setBannerImageUrl(url);
    } catch {
      setBannerError('Unable to reach the server. Please try again.');
    } finally {
      setGeneratingBanner(false);
    }
  }

  const previewContainerClassName =
    previewMode === 'mobile'
      ? 'mx-auto w-full max-w-[375px]'
      : 'mx-auto w-full max-w-2xl';

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Editor column */}
        <div className="w-full lg:w-1/2 space-y-4">
          {/* Generate with AI */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <h3 className="text-sm font-medium text-zinc-200">
              Generate with AI
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              Create a draft from a topic and tone. You can edit every field
              below after generation.
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label
                  htmlFor="ai-topic"
                  className="block text-xs font-medium text-zinc-300"
                >
                  Topic
                </label>
                <input
                  id="ai-topic"
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="e.g. Latest advances in AI agents"
                  className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-50 outline-none transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                  disabled={generating}
                />
              </div>
              <div>
                <label
                  htmlFor="ai-tone"
                  className="block text-xs font-medium text-zinc-300"
                >
                  Tone
                </label>
                <select
                  id="ai-tone"
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-50 outline-none transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                  disabled={generating}
                >
                  {TONE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="ai-audience"
                  className="block text-xs font-medium text-zinc-300"
                >
                  Target audience
                </label>
                <input
                  id="ai-audience"
                  type="text"
                  value={aiTargetAudience}
                  onChange={(e) => setAiTargetAudience(e.target.value)}
                  placeholder="e.g. Product managers and engineers"
                  className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-50 outline-none transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                  disabled={generating}
                />
              </div>
              <div>
                <label
                  htmlFor="ai-links"
                  className="block text-xs font-medium text-zinc-300"
                >
                  Reference links
                  <span className="ml-1 text-[11px] text-zinc-500">
                    (optional, one per line or comma-separated)
                  </span>
                </label>
                <textarea
                  id="ai-links"
                  value={aiReferenceLinks}
                  onChange={(e) => setAiReferenceLinks(e.target.value)}
                  placeholder="https://example.com/article-1"
                  rows={2}
                  className="mt-1 w-full resize-none rounded-md border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-50 outline-none transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                  disabled={generating}
                />
              </div>
              <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleGenerateDraft}
                  disabled={generating}
                  className="inline-flex items-center justify-center rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {generating ? 'Generating…' : 'Generate Draft'}
                </button>
                {generateError && (
                  <p className="text-xs text-red-400">{generateError}</p>
                )}
              </div>
              {keyPoints.length > 0 && (
                <div className="mt-3 rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
                  <p className="text-xs font-medium text-zinc-400">
                    Key points (from AI)
                  </p>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-zinc-300">
                    {keyPoints.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4"
            aria-label="Newsletter editor"
          >
            <div>
              <label
                htmlFor="newsletter-title"
                className="block text-xs font-medium text-zinc-300"
              >
                Title / Headline
              </label>
              <input
                id="newsletter-title"
                name="title"
                type="text"
                value={values.title}
                onChange={(event) => handleChange('title', event.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-50 outline-none ring-0 transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                placeholder="Daily AI Insights – October 2026"
                aria-invalid={Boolean(errors.title)}
                aria-describedby={
                  errors.title ? 'newsletter-title-error' : undefined
                }
              />
              {errors.title ? (
                <p
                  id="newsletter-title-error"
                  className="mt-1 text-xs text-red-400"
                >
                  {errors.title}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="newsletter-description"
                className="block text-xs font-medium text-zinc-300"
              >
                Summary / Description
                <span className="ml-1 text-[11px] text-zinc-500">
                  (optional)
                </span>
              </label>
              <textarea
                id="newsletter-description"
                name="description"
                value={values.description}
                onChange={(event) =>
                  handleChange('description', event.target.value)
                }
                className="mt-1 h-20 w-full resize-none rounded-md border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-50 outline-none ring-0 transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                placeholder="A concise overview for the email preheader and internal search."
              />
            </div>

            <div>
              <label
                htmlFor="newsletter-body"
                className="block text-xs font-medium text-zinc-300"
              >
                Body (Markdown)
              </label>
              <textarea
                id="newsletter-body"
                name="body"
                value={values.body}
                onChange={(event) => handleChange('body', event.target.value)}
                className="mt-1 h-40 w-full resize-y rounded-md border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-50 outline-none ring-0 transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                placeholder="Write or paste your newsletter content here. Basic markdown is supported for the preview."
                aria-invalid={Boolean(errors.body)}
                aria-describedby={
                  errors.body ? 'newsletter-body-error' : undefined
                }
              />
              {errors.body ? (
                <p
                  id="newsletter-body-error"
                  className="mt-1 text-xs text-red-400"
                >
                  {errors.body}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="sm:flex-1">
                <label
                  htmlFor="newsletter-tags"
                  className="block text-xs font-medium text-zinc-300"
                >
                  Tags
                  <span className="ml-1 text-[11px] text-zinc-500">
                    (comma separated)
                  </span>
                </label>
                <input
                  id="newsletter-tags"
                  name="tags"
                  type="text"
                  value={values.tagsInput}
                  onChange={(event) =>
                    handleChange('tagsInput', event.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-50 outline-none ring-0 transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                  placeholder="ai, product-updates, experiments"
                />
              </div>

              <div className="sm:w-40">
                <label
                  htmlFor="newsletter-status"
                  className="block text-xs font-medium text-zinc-300"
                >
                  Status
                </label>
                <select
                  id="newsletter-status"
                  name="status"
                  value={values.status}
                  onChange={(event) =>
                    handleChange(
                      'status',
                      event.target.value as NewsletterStatus,
                    )
                  }
                  className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-50 outline-none ring-0 transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                >
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save Draft'}
              </button>

              <div className="min-h-[1.25rem] text-xs">
                {saveError ? (
                  <p className="text-red-400">{saveError}</p>
                ) : saveSuccess ? (
                  <p className="text-emerald-400">{saveSuccess}</p>
                ) : hasErrors ? (
                  <p className="text-amber-300">
                    Please fix the highlighted fields before saving.
                  </p>
                ) : null}
              </div>
            </div>
          </form>

          {/* Generate banner */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <h3 className="text-sm font-medium text-zinc-200">Banner image</h3>
            <p className="mt-1 text-xs text-zinc-500">
              Generate an optional banner with AI. Save the draft first, then enter a prompt or use the title/description.
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label
                  htmlFor="banner-prompt"
                  className="block text-xs font-medium text-zinc-300"
                >
                  Prompt
                </label>
                <input
                  id="banner-prompt"
                  type="text"
                  value={bannerPrompt}
                  onChange={(e) => setBannerPrompt(e.target.value)}
                  placeholder="e.g. Minimal tech illustration, blue gradient"
                  className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-50 outline-none transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                  disabled={generatingBanner}
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleGenerateBanner}
                  disabled={generatingBanner}
                  className="inline-flex items-center justify-center rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {generatingBanner ? 'Generating…' : 'Generate banner'}
                </button>
                {bannerError ? (
                  <p className="text-xs text-red-400">{bannerError}</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Preview column */}
        <div className="w-full lg:w-1/2">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-zinc-300">Live preview</p>
            <div className="inline-flex items-center gap-1 rounded-full bg-zinc-900/80 p-1 text-xs">
              <button
                type="button"
                onClick={() => setPreviewMode('desktop')}
                className={`rounded-full px-2.5 py-1 ${
                  previewMode === 'desktop'
                    ? 'bg-zinc-100 text-zinc-900'
                    : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('mobile')}
                className={`rounded-full px-2.5 py-1 ${
                  previewMode === 'mobile'
                    ? 'bg-zinc-100 text-zinc-900'
                    : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                Mobile
              </button>
            </div>
          </div>

          <div
            className={`${previewContainerClassName} rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 text-sm text-zinc-100 shadow-sm`}
          >
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              Orion Newsletter · Preview
            </p>

            {bannerImageUrl ? (
              <img
                src={bannerImageUrl}
                alt=""
                className="mt-2 w-full rounded-md object-cover"
                style={{ maxHeight: '200px', objectFit: 'cover' }}
              />
            ) : null}

            <h3 className="mt-2 text-lg font-semibold leading-tight text-zinc-50">
              {values.title.trim() || 'Your newsletter title will appear here'}
            </h3>

            {values.description.trim() ? (
              <p className="mt-1 text-xs text-zinc-400">
                {values.description.trim()}
              </p>
            ) : null}

            {parsedTags.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {parsedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-zinc-900/70 px-2 py-0.5 text-[11px] text-zinc-300 ring-1 ring-zinc-700/80"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-4 space-y-2 text-sm leading-relaxed text-zinc-100">
              {renderBodyPreview(values.body)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function renderBodyPreview(body: string) {
  const trimmed = body.trim();
  if (!trimmed) {
    return (
      <p className="text-xs text-zinc-500">
        Start typing your newsletter body to see a live preview here. Basic
        paragraphs and line breaks are supported.
      </p>
    );
  }

  const paragraphs = trimmed.split(/\n{2,}/);

  return paragraphs.map((paragraph, index) => (
    <p key={index} className="whitespace-pre-wrap">
      {paragraph}
    </p>
  ));
}

