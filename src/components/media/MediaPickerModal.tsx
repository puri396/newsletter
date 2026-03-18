"use client";

import { useEffect } from "react";
import { MediaLibrary } from "./MediaLibrary";
import { MediaUploadButton } from "./MediaUploadButton";

interface MediaPickerModalProps {
  onSelect: (url: string) => void;
  onClose: () => void;
  title?: string;
}

export function MediaPickerModal({
  onSelect,
  onClose,
  title = "Select Image",
}: MediaPickerModalProps) {
  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleSelect(url: string) {
    onSelect(url);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 flex w-full max-w-3xl flex-col rounded-2xl border border-zinc-700/60 bg-zinc-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
          <div className="flex items-center gap-3">
            <MediaUploadButton
              onUploaded={() => {
                // Refresh by re-mounting handled inside MediaLibrary
                window.dispatchEvent(new CustomEvent("media-uploaded"));
              }}
              className="shrink-0"
            />
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Gallery */}
        <div className="max-h-[60vh] overflow-y-auto p-5">
          <MediaLibrary onSelect={handleSelect} showUpload={false} />
        </div>
      </div>
    </div>
  );
}
