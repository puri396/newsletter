"use client";

import { useState } from "react";

export interface SocialSharePanelProps {
  title: string;
  description?: string;
  /** Public URL for the content (e.g. /blog/slug). If absent, Facebook falls back to subscribe page. */
  url?: string;
  /** Banner or generated image URL */
  imageUrl?: string;
  hashtags?: string[];
  /**
   * compact=true → icon-only horizontal row (used on public blog page)
   * compact=false → labeled vertical panel (used in dashboard sidebar)
   */
  compact?: boolean;
}

const SUBSCRIBE_FALLBACK = "/subscribe";

function buildCaption(title: string, description?: string, hashtags?: string[]): string {
  const parts: string[] = [title];
  if (description?.trim()) parts.push(description.trim());
  if (hashtags?.length) parts.push(hashtags.map((h) => `#${h}`).join(" "));
  return parts.join("\n\n");
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.884v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

export function SocialSharePanel({
  title,
  description,
  url,
  imageUrl,
  hashtags = [],
  compact = false,
}: SocialSharePanelProps) {
  const [igCopied, setIgCopied] = useState(false);
  const [igExpanded, setIgExpanded] = useState(false);

  const APP_URL =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? "";

  const shareUrl = url ?? `${APP_URL}${SUBSCRIBE_FALLBACK}`;
  const caption = buildCaption(title, description, hashtags);

  function handleFacebook() {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "noopener,noreferrer,width=600,height=400",
    );
  }

  function handleWhatsApp() {
    const text = url ? `${title}\n\n${url}` : title;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  async function handleInstagram() {
    try {
      await navigator.clipboard.writeText(caption);
      setIgCopied(true);
      setIgExpanded(true);
      setTimeout(() => setIgCopied(false), 2500);
    } catch {
      // Fallback: show the text area for manual copy
      setIgExpanded(true);
    }
  }

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Share:</span>
          <div className="flex items-center gap-1.5">
            {/* Facebook */}
            <button
              type="button"
              onClick={handleFacebook}
              title="Share on Facebook"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1877F2] text-white transition hover:opacity-90 active:scale-95"
            >
              <FacebookIcon className="h-4 w-4" />
              <span className="sr-only">Share on Facebook</span>
            </button>

            {/* WhatsApp */}
            <button
              type="button"
              onClick={handleWhatsApp}
              title="Share on WhatsApp"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366] text-white transition hover:opacity-90 active:scale-95"
            >
              <WhatsAppIcon className="h-4 w-4" />
              <span className="sr-only">Share on WhatsApp</span>
            </button>

            {/* Instagram */}
            <button
              type="button"
              onClick={handleInstagram}
              title="Copy caption for Instagram"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] text-white transition hover:opacity-90 active:scale-95"
            >
              {igCopied ? (
                <CheckIcon className="h-4 w-4" />
              ) : (
                <InstagramIcon className="h-4 w-4" />
              )}
              <span className="sr-only">Copy caption for Instagram</span>
            </button>

            {/* Copy link */}
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(shareUrl);
              }}
              title="Copy link"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-slate-200 transition hover:bg-slate-600 active:scale-95"
            >
              <CopyIcon className="h-4 w-4" />
              <span className="sr-only">Copy link</span>
            </button>
          </div>
        </div>

        {igExpanded && (
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-slate-300">
            <p className="mb-1.5 font-medium text-slate-200">Instagram caption copied!</p>
            <p className="mb-2 text-slate-400">
              Open Instagram, create a new post, and paste the caption.
            </p>
            {imageUrl && (
              <a
                href={imageUrl}
                download
                className="inline-flex items-center gap-1.5 rounded-md bg-slate-700 px-2.5 py-1 text-xs text-slate-200 transition hover:bg-slate-600"
              >
                <DownloadIcon className="h-3.5 w-3.5" />
                Download image
              </a>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full labeled panel (dashboard sidebar)
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 text-xs text-zinc-300">
      <p className="mb-3 font-medium text-zinc-200">Share</p>

      <div className="space-y-2">
        {/* Facebook */}
        <button
          type="button"
          onClick={handleFacebook}
          className="flex w-full items-center gap-3 rounded-md bg-[#1877F2]/10 px-3 py-2 text-[13px] font-medium text-[#4f9eff] transition hover:bg-[#1877F2]/20 active:scale-[0.98]"
        >
          <FacebookIcon className="h-4 w-4 shrink-0" />
          Share on Facebook
        </button>

        {/* WhatsApp */}
        <button
          type="button"
          onClick={handleWhatsApp}
          className="flex w-full items-center gap-3 rounded-md bg-[#25D366]/10 px-3 py-2 text-[13px] font-medium text-[#25D366] transition hover:bg-[#25D366]/20 active:scale-[0.98]"
        >
          <WhatsAppIcon className="h-4 w-4 shrink-0" />
          Share on WhatsApp
        </button>

        {/* Instagram */}
        <button
          type="button"
          onClick={handleInstagram}
          className="flex w-full items-center gap-3 rounded-md bg-gradient-to-r from-[#f09433]/10 to-[#bc1888]/10 px-3 py-2 text-[13px] font-medium text-pink-400 transition hover:from-[#f09433]/20 hover:to-[#bc1888]/20 active:scale-[0.98]"
        >
          <InstagramIcon className="h-4 w-4 shrink-0" />
          {igCopied ? "Caption copied!" : "Copy for Instagram"}
          {igCopied && <CheckIcon className="ml-auto h-3.5 w-3.5 text-emerald-400" />}
        </button>

        {/* Copy link */}
        <CopyLinkButton shareUrl={shareUrl} hasPublicUrl={!!url} />
      </div>

      {/* Instagram instructions callout */}
      {igExpanded && (
        <div className="mt-3 rounded-md border border-pink-900/40 bg-pink-950/30 p-3 text-[11px] text-pink-200/80">
          <p className="mb-1 font-medium text-pink-200">How to post on Instagram:</p>
          <ol className="space-y-0.5 pl-4 list-decimal text-pink-300/80">
            <li>Caption has been copied to your clipboard</li>
            {imageUrl && <li>Download the image below</li>}
            <li>Open Instagram and tap the + button</li>
            <li>Select your image and paste the caption</li>
          </ol>
          {imageUrl && (
            <a
              href={imageUrl}
              download
              className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-pink-900/40 px-2.5 py-1 text-[11px] text-pink-200 transition hover:bg-pink-900/60"
            >
              <DownloadIcon className="h-3 w-3" />
              Download image
            </a>
          )}
        </div>
      )}

      {/* Caption preview (non-compact) */}
      <div className="mt-3 rounded-md border border-zinc-800 bg-zinc-950/60 p-2">
        <p className="mb-1 text-[10px] text-zinc-500">Preview caption</p>
        <p className="whitespace-pre-wrap break-words text-[11px] text-zinc-400 line-clamp-3">
          {caption}
        </p>
      </div>
    </div>
  );
}

function CopyLinkButton({ shareUrl, hasPublicUrl }: { shareUrl: string; hasPublicUrl: boolean }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex w-full items-center gap-3 rounded-md bg-zinc-800/60 px-3 py-2 text-[13px] font-medium text-zinc-300 transition hover:bg-zinc-800 active:scale-[0.98]"
      title={hasPublicUrl ? "Copy public link" : "Copy subscribe page link"}
    >
      {copied ? <CheckIcon className="h-4 w-4 shrink-0 text-emerald-400" /> : <CopyIcon className="h-4 w-4 shrink-0" />}
      {copied ? "Link copied!" : hasPublicUrl ? "Copy public link" : "Copy link"}
    </button>
  );
}
