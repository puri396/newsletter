'use client';

import { useMemo, useState, useRef, useEffect, type FormEvent } from 'react';
import type { NewsletterStatus } from '@/prisma-client/enums';
import { getApiErrorMessage } from '@/lib/api/get-error-message';
import type { NewsletterTemplateStyle } from '@/lib/newsletter/templates';
import { NewsletterTemplatePreview } from '@/components/newsletter/preview/NewsletterTemplatePreview';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { MediaPickerModal } from '@/components/media/MediaPickerModal';

interface NewsletterEditorProps {
  initialValues?: Partial<NewsletterFormValues> & {
    newsletterId?: string;
    bannerImageUrl?: string | null;
    logoUrl?: string | null;
  };
  onSaved?: (newsletter: ApiNewsletter) => void;
  previewStyle?: NewsletterTemplateStyle;
  /** 'blog' | 'newsletter' — controls which email template is used when broadcasting. */
  contentType?: 'newsletter' | 'blog';
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
  logoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CreateNewsletterResponse {
  data?: ApiNewsletter;
  error?: string;
}

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
  previewStyle = "posterDark",
  contentType = "newsletter",
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
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

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
  const [bannerUrlInput, setBannerUrlInput] = useState<string>(
    initialValues?.bannerImageUrl ?? '',
  );
  const [bannerPrompt, setBannerPrompt] = useState('');
  const [generatingBanner, setGeneratingBanner] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [showBannerPicker, setShowBannerPicker] = useState(false);

  // Logo state
  const [logoUrl, setLogoUrl] = useState<string | null>(
    initialValues?.logoUrl ?? null,
  );
  const [showLogoPicker, setShowLogoPicker] = useState(false);

  // Export state
  const [downloadingFormat, setDownloadingFormat] = useState<'pdf' | 'png' | 'jpg' | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Share state
  const [shareEmail, setShareEmail] = useState('');
  const [sharingPreview, setSharingPreview] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);

  // Publish & Send state
  const [activeSubscriberCount, setActiveSubscriberCount] = useState<number | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{ sent: number; failed: number } | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    fetch('/api/subscribers/count')
      .then((r) => r.json())
      .then((data: { count?: number }) => {
        if (typeof data.count === 'number') setActiveSubscriberCount(data.count);
      })
      .catch(() => {});
  }, []);

  function handleChange<K extends keyof NewsletterFormValues>(
    key: K,
    nextValue: NewsletterFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: nextValue }));
    if (key === 'title' && errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
    if (key === 'body' && errors.body) setErrors((prev) => ({ ...prev, body: undefined }));
  }

  function validate(): boolean {
    const nextErrors: NewsletterFormErrors = {};
    if (!values.title.trim()) nextErrors.title = 'Title is required.';
    if (!values.body.trim() || values.body === '<p></p>') nextErrors.body = 'Body is required.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function buildPayload(status: NewsletterStatus) {
    return {
      subject: values.title.trim(),
      description: values.description.trim() || undefined,
      body: values.body.trim(),
      status,
      tags: parsedTags,
      contentType,
      bannerImageUrl: bannerImageUrl ?? undefined,
      logoUrl: logoUrl ?? undefined,
      // Persist presentation style so view/edit/listing can render consistently.
      epicMetadata: {
        templateStyle: previewStyle,
      },
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveError(null);
    setSaveSuccess(null);
    if (!validate()) return;
    setSaving(true);
    const existingId = lastSavedId ?? initialValues?.newsletterId;
    try {
      const url = existingId ? `/api/newsletters/${existingId}` : '/api/newsletters';
      const method = existingId ? 'PATCH' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(values.status)),
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
      if (json.data.logoUrl !== undefined) {
        setLogoUrl(json.data.logoUrl ?? null);
      }
      setSaveSuccess(existingId ? 'Draft updated.' : 'Draft saved successfully.');
      onSaved?.(json.data);
    } catch {
      setSaveError('Unable to reach the server. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePublishAndSend() {
    setPublishError(null);
    setPublishResult(null);
    if (!validate()) return;
    setPublishing(true);
    const existingId = lastSavedId ?? initialValues?.newsletterId;
    try {
      const saveUrl = existingId ? `/api/newsletters/${existingId}` : '/api/newsletters';
      const saveMethod = existingId ? 'PATCH' : 'POST';
      const saveRes = await fetch(saveUrl, {
        method: saveMethod,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload('draft')),
      });
      const saveJson = (await saveRes.json()) as CreateNewsletterResponse & { data?: ApiNewsletter };
      if (!saveRes.ok) {
        setPublishError(getApiErrorMessage(saveJson, 'Failed to save before sending.'));
        return;
      }
      const savedId = saveJson.data?.id;
      if (!savedId) {
        setPublishError('Unexpected server response.');
        return;
      }
      setLastSavedId(savedId);

      const publishRes = await fetch(`/api/newsletters/${savedId}/publish-now`, {
        method: 'POST',
      });
      const publishJson = (await publishRes.json()) as { sent?: number; failed?: number; message?: string; error?: string };
      if (!publishRes.ok) {
        setPublishError(publishJson.error ?? 'Failed to send to subscribers.');
        return;
      }
      setPublishResult({
        sent: publishJson.sent ?? 0,
        failed: publishJson.failed ?? 0,
      });
    } catch {
      setPublishError('Unable to reach the server. Please try again.');
    } finally {
      setPublishing(false);
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
      const json = (await response.json()) as GenerateNewsletterResponse & { error?: string };
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
      const data = (await res.json()) as { url?: string; error?: string };
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
        setBannerUrlInput(url);
        setBannerError('Banner generated but failed to save. You can try saving the draft again.');
        return;
      }
      setBannerImageUrl(url);
      setBannerUrlInput(url);
    } catch {
      setBannerError('Unable to reach the server. Please try again.');
    } finally {
      setGeneratingBanner(false);
    }
  }

  function handleApplyBannerUrl() {
    const url = bannerUrlInput.trim();
    setBannerImageUrl(url || null);
  }

  async function handleDownload(format: 'pdf' | 'png' | 'jpg') {
    const wrapperEl = previewRef.current;
    if (!wrapperEl) {
      setDownloadError('Preview panel not found. Please try again.');
      return;
    }
    setDownloadingFormat(format);
    setDownloadError(null);

    // We capture the inner NewsletterTemplatePreview div (first child of the
    // wrapper) rather than the wrapper itself. The wrapper has `mx-auto` which
    // causes the browser to compute a positive margin-left once we give it an
    // explicit pixel width (narrower than the column). html-to-image faithfully
    // copies that computed margin to the clone, shifting the content to the
    // right and leaving a black gap on the left. The inner div has no margins.
    const el = (wrapperEl.firstElementChild as HTMLElement) ?? wrapperEl;

    // Standard newsletter width — consistent output across all viewport sizes.
    const CAPTURE_WIDTH = 640;

    // Temporarily fix the element's width so every descendant reflows to
    // exactly CAPTURE_WIDTH before html-to-image clones the subtree.
    const savedWrapperStyle = wrapperEl.style.cssText;
    const savedElStyle = el.style.cssText;

    try {
      // First: make the wrapper borderless and exactly CAPTURE_WIDTH so the
      // inner div inherits the full width with no border-induced offset.
      wrapperEl.style.cssText = [
        `width: ${CAPTURE_WIDTH}px`,
        `max-width: ${CAPTURE_WIDTH}px`,
        `min-width: ${CAPTURE_WIDTH}px`,
        `margin: 0`,
        `padding: 0`,
        `border-width: 0`,
        `overflow: hidden`,
        `box-sizing: border-box`,
      ].join('; ');

      // Second: pin the inner element too so html-to-image never falls back to
      // scrollWidth measurements.
      el.style.cssText = [
        `width: ${CAPTURE_WIDTH}px`,
        `max-width: ${CAPTURE_WIDTH}px`,
        `min-width: ${CAPTURE_WIDTH}px`,
        `margin: 0`,
        `overflow: hidden`,
        `box-sizing: border-box`,
      ].join('; ');

      // Two animation frames: first applies styles, second repaints.
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => { requestAnimationFrame(() => resolve()); });
      });

      // Re-read height after reflow at the new width.
      const captureH = el.offsetHeight;

      const { toPng, toJpeg } = await import('html-to-image');
      const filename = `newsletter-preview.${format}`;

      // At this point the DOM is correct — no style override inside captureOptions
      // needed. backgroundColor is a last-resort fallback only.
      const captureOptions = {
        backgroundColor: '#ffffff',
        width: CAPTURE_WIDTH,
        height: captureH,
        pixelRatio: 2,
      };

      if (format === 'pdf') {
        const imgData = await toJpeg(el, { ...captureOptions, quality: 0.95 });
        const { jsPDF } = await import('jspdf');
        const pdf = new jsPDF({
          orientation: CAPTURE_WIDTH > captureH ? 'landscape' : 'portrait',
          unit: 'px',
          format: [CAPTURE_WIDTH, captureH],
        });
        pdf.addImage(imgData, 'JPEG', 0, 0, CAPTURE_WIDTH, captureH);
        pdf.save(filename);
      } else {
        const dataUrl =
          format === 'jpg'
            ? await toJpeg(el, { ...captureOptions, quality: 0.95 })
            : await toPng(el, captureOptions);
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Download failed:', msg);
      setDownloadError(
        "Download failed. Please try again or use your browser's print/save option.",
      );
    } finally {
      // Always restore both elements' original inline styles.
      wrapperEl.style.cssText = savedWrapperStyle;
      el.style.cssText = savedElStyle;
      setDownloadingFormat(null);
    }
  }

  async function handleSharePreview() {
    const email = shareEmail.trim();
    if (!email) {
      setShareError('Enter a recipient email address.');
      return;
    }
    setSharingPreview(true);
    setShareMessage(null);
    setShareError(null);
    try {
      const res = await fetch('/api/newsletters/share-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: values.title.trim() || 'Newsletter Preview',
          description: values.description.trim(),
          body: values.body.trim(),
          bannerImageUrl: bannerImageUrl ?? undefined,
          toEmail: email,
        }),
      });
      const json = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !json.success) {
        setShareError(json.error ?? 'Failed to send preview.');
        return;
      }
      setShareMessage(`Preview sent to ${email}`);
      setShareEmail('');
    } catch {
      setShareError('Unable to reach the server. Please try again.');
    } finally {
      setSharingPreview(false);
    }
  }

  const previewContainerClassName =
    previewMode === 'mobile' ? 'mx-auto w-full max-w-[375px]' : 'mx-auto w-full max-w-2xl';

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* ── Editor column ── */}
        <div className="w-full lg:w-1/2 space-y-4">

          {/* Generate with AI */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <h3 className="text-sm font-medium text-zinc-200">Generate with AI</h3>
            <p className="mt-1 text-xs text-zinc-500">
              Create a draft from a topic and tone. You can edit every field below after generation.
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label htmlFor="ai-topic" className="block text-xs font-medium text-zinc-300">Topic</label>
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
                <label htmlFor="ai-tone" className="block text-xs font-medium text-zinc-300">Tone</label>
                <select
                  id="ai-tone"
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-50 outline-none transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                  disabled={generating}
                >
                  {TONE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="ai-audience" className="block text-xs font-medium text-zinc-300">Target audience</label>
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
                <label htmlFor="ai-links" className="block text-xs font-medium text-zinc-300">
                  Reference links
                  <span className="ml-1 text-[11px] text-zinc-500">(optional, one per line or comma-separated)</span>
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
                {generateError && <p className="text-xs text-red-400">{generateError}</p>}
              </div>
              {keyPoints.length > 0 && (
                <div className="mt-3 rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
                  <p className="text-xs font-medium text-zinc-400">Key points (from AI)</p>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-zinc-300">
                    {keyPoints.map((point, i) => <li key={i}>{point}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Editor form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4"
            aria-label="Newsletter editor"
          >
            {/* Title */}
            <div>
              <label htmlFor="newsletter-title" className="block text-xs font-medium text-zinc-300">
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
              />
              {errors.title ? <p className="mt-1 text-xs text-red-400">{errors.title}</p> : null}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="newsletter-description" className="block text-xs font-medium text-zinc-300">
                Summary / Description
                <span className="ml-1 text-[11px] text-zinc-500">(optional)</span>
              </label>
              <textarea
                id="newsletter-description"
                name="description"
                value={values.description}
                onChange={(event) => handleChange('description', event.target.value)}
                className="mt-1 h-20 w-full resize-none rounded-md border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-50 outline-none ring-0 transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                placeholder="A concise overview for the email preheader and internal search."
              />
            </div>

            {/* Body — Rich Text Editor */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-300">
                Body
              </label>
              <RichTextEditor
                value={values.body}
                onChange={(html) => handleChange('body', html)}
                placeholder="Write your content here. Use the toolbar to format text, insert images from the Media Library, and add links."
                minHeight={320}
              />
              {errors.body ? <p className="mt-1 text-xs text-red-400">{errors.body}</p> : null}
            </div>

            {/* Tags + Status */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="sm:flex-1">
                <label htmlFor="newsletter-tags" className="block text-xs font-medium text-zinc-300">
                  Tags
                  <span className="ml-1 text-[11px] text-zinc-500">(comma separated)</span>
                </label>
                <input
                  id="newsletter-tags"
                  name="tags"
                  type="text"
                  value={values.tagsInput}
                  onChange={(event) => handleChange('tagsInput', event.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-50 outline-none ring-0 transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                  placeholder="ai, product-updates, experiments"
                />
              </div>
              <div className="sm:w-40">
                <label htmlFor="newsletter-status" className="block text-xs font-medium text-zinc-300">Status</label>
                <select
                  id="newsletter-status"
                  name="status"
                  value={values.status}
                  onChange={(event) => handleChange('status', event.target.value as NewsletterStatus)}
                  className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-50 outline-none ring-0 transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                >
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            {/* Save Draft + Publish & Send */}
            <div className="flex flex-col gap-3 pt-2">
              {activeSubscriberCount !== null && (
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <svg className="h-3.5 w-3.5 shrink-0 text-indigo-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="6" cy="5" r="2.5" />
                    <path d="M1 13c0-2.5 2-4 5-4" />
                    <circle cx="12" cy="9" r="2" />
                    <path d="M9 13c0-1.5 1.3-2.5 3-2.5s3 1 3 2.5" />
                  </svg>
                  <span>
                    <span className="font-medium text-zinc-200">{activeSubscriberCount}</span> active subscriber{activeSubscriberCount !== 1 ? 's' : ''} will receive the email
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="submit"
                  disabled={saving || publishing}
                  className="inline-flex items-center justify-center rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save Draft'}
                </button>

                <button
                  type="button"
                  onClick={handlePublishAndSend}
                  disabled={publishing || saving}
                  className="inline-flex items-center gap-1.5 justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {publishing ? (
                    <>
                      <span className="animate-spin h-3.5 w-3.5 border border-white border-t-transparent rounded-full" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 8l12-6-5 12-2-5-5-1z" />
                      </svg>
                      Publish &amp; Send to Subscribers
                    </>
                  )}
                </button>
              </div>

              <div className="min-h-[1.25rem] text-xs space-y-1">
                {saveError ? (
                  <p className="text-red-400">{saveError}</p>
                ) : saveSuccess ? (
                  <p className="text-emerald-400">{saveSuccess}</p>
                ) : hasErrors ? (
                  <p className="text-amber-300">Please fix the highlighted fields before saving.</p>
                ) : null}

                {publishError ? (
                  <p className="text-red-400">{publishError}</p>
                ) : publishResult ? (
                  <p className="text-emerald-400">
                    ✓ Sent to {publishResult.sent} subscriber{publishResult.sent !== 1 ? 's' : ''}
                    {publishResult.failed > 0 ? ` (${publishResult.failed} failed)` : ''}.
                  </p>
                ) : null}
              </div>
            </div>
          </form>

          {/* ── Logo section ── */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-zinc-200">Logo</h3>
                <p className="mt-0.5 text-xs text-zinc-500">Shown at the top of the email and preview.</p>
              </div>
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl(null)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              )}
            </div>

            {logoUrl ? (
              <div className="flex items-center gap-3 rounded-lg border border-zinc-700/60 bg-zinc-900/60 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoUrl} alt="Logo preview" className="h-10 max-w-[120px] rounded object-contain" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-zinc-300">{logoUrl}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLogoPicker(true)}
                  className="shrink-0 rounded-md border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowLogoPicker(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-700 py-5 text-sm text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-300"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Pick from Media Library
              </button>
            )}
          </div>

          {/* Banner image section */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-4">
            <h3 className="text-sm font-medium text-zinc-200">Banner image</h3>

            {/* Pick from media library */}
            <button
              type="button"
              onClick={() => setShowBannerPicker(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 transition hover:bg-zinc-800 hover:text-zinc-100"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Pick from Media Library
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-zinc-800" />
              <span className="text-[11px] text-zinc-500">or paste URL</span>
              <div className="h-px flex-1 bg-zinc-800" />
            </div>

            <div>
              <div className="flex gap-2">
                <input
                  id="banner-url-input"
                  type="url"
                  value={bannerUrlInput}
                  onChange={(e) => setBannerUrlInput(e.target.value)}
                  placeholder="https://example.com/banner.jpg"
                  className="flex-1 rounded-md border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-50 outline-none transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                />
                <button
                  type="button"
                  onClick={handleApplyBannerUrl}
                  className="shrink-0 rounded-md border border-zinc-600 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
                >
                  Apply
                </button>
                {bannerImageUrl ? (
                  <button
                    type="button"
                    onClick={() => { setBannerImageUrl(null); setBannerUrlInput(''); }}
                    className="shrink-0 rounded-md border border-red-800/50 px-3 py-2 text-sm text-red-400 hover:bg-red-950/40"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-zinc-800" />
              <span className="text-[11px] text-zinc-500">or generate with AI</span>
              <div className="h-px flex-1 bg-zinc-800" />
            </div>

            <div>
              <p className="text-xs text-zinc-500">
                Save the draft first, then enter a prompt or use the title/description.
              </p>
              <div className="mt-3 space-y-3">
                <div>
                  <label htmlFor="banner-prompt" className="block text-xs font-medium text-zinc-300">AI Prompt</label>
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
                    {generatingBanner ? 'Generating…' : 'Generate banner with AI'}
                  </button>
                  {bannerError ? <p className="text-xs text-red-400">{bannerError}</p> : null}
                </div>
              </div>
            </div>
          </div>

          {/* ── Export & Share panel ── */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-5">
            <h3 className="text-sm font-medium text-zinc-200">Export & Share</h3>

            <div>
              <p className="text-xs font-medium text-zinc-400 mb-2">Download preview as</p>
              <div className="flex flex-wrap gap-2">
                {(['png', 'jpg', 'pdf'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => handleDownload(fmt)}
                    disabled={downloadingFormat !== null}
                    className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {downloadingFormat === fmt ? (
                      <span className="animate-spin h-3 w-3 border border-zinc-400 border-t-transparent rounded-full" />
                    ) : (
                      <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 2v8M5 8l3 3 3-3" />
                        <path d="M2 13h12" />
                      </svg>
                    )}
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-zinc-500">
                Exports the live preview panel exactly as displayed.
              </p>
              {downloadError ? (
                <p className="mt-1.5 text-xs text-red-400">{downloadError}</p>
              ) : null}
            </div>

            <div className="h-px bg-zinc-800" />

            <div>
              <p className="text-xs font-medium text-zinc-400 mb-2">Share preview by email</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="recipient@example.com"
                  className="flex-1 rounded-md border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-50 outline-none transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void handleSharePreview(); } }}
                />
                <button
                  type="button"
                  onClick={handleSharePreview}
                  disabled={sharingPreview || !shareEmail.trim()}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sharingPreview ? 'Sending…' : 'Send preview'}
                </button>
              </div>
              {shareError ? (
                <p className="mt-2 text-xs text-red-400">{shareError}</p>
              ) : shareMessage ? (
                <p className="mt-2 text-xs text-emerald-400">{shareMessage}</p>
              ) : (
                <p className="mt-2 text-[11px] text-zinc-500">
                  Sends the newsletter HTML preview to the specified email. No DB record is created.
                </p>
              )}
            </div>
          </div>

        </div>

        {/* ── Preview column ── */}
        <div className="w-full lg:w-1/2">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-zinc-300">Live preview</p>
            <div className="inline-flex items-center gap-1 rounded-full bg-zinc-900/80 p-1 text-xs">
              <button
                type="button"
                onClick={() => setPreviewMode('desktop')}
                className={`rounded-full px-2.5 py-1 ${previewMode === 'desktop' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 hover:text-zinc-100'}`}
              >
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('mobile')}
                className={`rounded-full px-2.5 py-1 ${previewMode === 'mobile' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 hover:text-zinc-100'}`}
              >
                Mobile
              </button>
            </div>
          </div>

          <div
            ref={previewRef}
            className={`${previewContainerClassName} overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-zinc-100 shadow-sm`}
          >
            <NewsletterTemplatePreview
              title={values.title.trim() || 'Your newsletter title will appear here'}
              description={values.description.trim() || undefined}
              body={values.body}
              bannerImageUrl={bannerImageUrl}
              logoUrl={logoUrl}
              tags={parsedTags}
              style={previewStyle}
              mode="full"
            />
          </div>
        </div>
      </div>

      {/* Logo picker modal */}
      {showLogoPicker && (
        <MediaPickerModal
          title="Select Logo"
          onSelect={(url) => setLogoUrl(url)}
          onClose={() => setShowLogoPicker(false)}
        />
      )}

      {/* Banner picker modal */}
      {showBannerPicker && (
        <MediaPickerModal
          title="Select Banner Image"
          onSelect={(url) => { setBannerImageUrl(url); setBannerUrlInput(url); }}
          onClose={() => setShowBannerPicker(false)}
        />
      )}
    </section>
  );
}
