"use client";

import { useEffect } from "react";
import { SocialSharePanel } from "./SocialSharePanel";

export interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  /** Public URL for the content (e.g. /blog/slug) */
  url?: string;
  /** Banner or generated image URL */
  imageUrl?: string;
  hashtags?: string[];
}

export function ShareModal({
  open,
  onClose,
  title,
  description,
  url,
  imageUrl,
  hashtags,
}: ShareModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Share content"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div className="relative w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-50">Share Content</h2>
            <p className="mt-0.5 max-w-[240px] truncate text-xs text-zinc-400" title={title}>
              {title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
            aria-label="Close"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <SocialSharePanel
          title={title}
          description={description}
          url={url}
          imageUrl={imageUrl}
          hashtags={hashtags}
          compact={false}
        />
      </div>
    </div>
  );
}
