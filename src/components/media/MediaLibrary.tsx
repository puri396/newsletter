"use client";

import { useCallback, useEffect, useState } from "react";
import { MediaUploadButton } from "./MediaUploadButton";

interface MediaItem {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  altText?: string | null;
  createdAt: string;
  /** Absolute URL served by /api/media/[id] — use this as <img src> */
  url?: string;
}

interface MediaLibraryProps {
  /** When provided the library is in "picker" mode — clicking any card selects it */
  onSelect?: (url: string, altText?: string) => void;
  /** Show the upload button inline (default true) */
  showUpload?: boolean;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaLibrary({ onSelect, showUpload = true }: MediaLibraryProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [generatingAltId, setGeneratingAltId] = useState<string | null>(null);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/media");
      const data = (await res.json()) as { media: MediaItem[] };
      setItems(data.media ?? []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMedia();
  }, [fetchMedia]);

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (!confirm("Delete this image?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/media/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((m) => m.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleGenerateAlt(e: React.MouseEvent, item: MediaItem) {
    e.stopPropagation();
    setGeneratingAltId(item.id);
    try {
      const res = await fetch("/api/ai/alt-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: item.id }),
      });
      if (res.ok) {
        const json = (await res.json()) as { altText?: string };
        if (json.altText) {
          setItems((prev) =>
            prev.map((m) => (m.id === item.id ? { ...m, altText: json.altText } : m)),
          );
        }
      }
    } catch {
      /* ignore */
    } finally {
      setGeneratingAltId(null);
    }
  }

  const isPickerMode = !!onSelect;

  return (
    <div className="space-y-4">
      {showUpload && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-400">
            {items.length} {items.length === 1 ? "image" : "images"}
          </p>
          <MediaUploadButton onUploaded={fetchMedia} />
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-xl bg-zinc-800" />
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 py-16 text-center">
          <svg className="mb-3 h-10 w-10 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm font-medium text-zinc-400">No images yet</p>
          <p className="mt-1 text-xs text-zinc-600">Upload an image to get started</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => {
            const imageUrl = `/api/media/${item.id}`;
            const isGenAlt = generatingAltId === item.id;
            return (
              <div
                key={item.id}
                onClick={isPickerMode ? () => onSelect(imageUrl, item.altText ?? undefined) : undefined}
                className={[
                  "group relative overflow-hidden rounded-xl border bg-zinc-900 transition",
                  isPickerMode
                    ? "cursor-pointer border-zinc-700/60 hover:border-cyan-400 hover:ring-2 hover:ring-cyan-400/40 active:scale-95"
                    : "border-zinc-700/60",
                ].join(" ")}
              >
                {/* Thumbnail */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={item.altText ?? item.name}
                  className="aspect-square w-full object-cover"
                  loading="lazy"
                />

                {/* Picker-mode: always-visible bottom label */}
                {isPickerMode && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/90 to-transparent px-2 pb-2 pt-6">
                    <p className="truncate text-[10px] font-medium text-zinc-200">{item.name}</p>
                    {item.altText ? (
                      <p className="mt-0.5 truncate text-[9px] italic text-zinc-400" title={item.altText}>
                        {item.altText}
                      </p>
                    ) : (
                      <p className="text-[10px] text-zinc-400">{formatBytes(item.size)}</p>
                    )}
                  </div>
                )}

                {/* Picker-mode: check icon overlay on hover */}
                {isPickerMode && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="rounded-full bg-cyan-500 p-2 shadow-lg">
                      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Non-picker mode: hover overlay with info + actions */}
                {!isPickerMode && (
                  <div className="absolute inset-0 flex flex-col justify-between bg-zinc-950/80 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex justify-end gap-1">
                      {/* Generate alt text button */}
                      <button
                        type="button"
                        onClick={(e) => void handleGenerateAlt(e, item)}
                        disabled={isGenAlt}
                        className="rounded-lg bg-zinc-700/80 p-1.5 text-zinc-200 hover:bg-cyan-700/80 hover:text-white disabled:opacity-50 transition-colors"
                        title={item.altText ? "Regenerate alt text" : "Generate alt text"}
                      >
                        {isGenAlt ? (
                          <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                        )}
                      </button>
                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, item.id)}
                        disabled={deletingId === item.id}
                        className="rounded-lg bg-red-600/80 p-1.5 text-white hover:bg-red-600 disabled:opacity-50"
                        title="Delete"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <div>
                      <p className="truncate text-[10px] font-medium text-zinc-200">{item.name}</p>
                      {item.altText ? (
                        <p
                          className="mt-0.5 line-clamp-2 text-[9px] italic text-zinc-400"
                          title={item.altText}
                        >
                          {item.altText}
                        </p>
                      ) : (
                        <p className="text-[10px] text-zinc-400">{formatBytes(item.size)}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Delete button in picker mode (top-right, appears on hover) */}
                {isPickerMode && (
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, item.id)}
                    disabled={deletingId === item.id}
                    className="absolute right-1.5 top-1.5 rounded-lg bg-red-600/80 p-1 text-white opacity-0 transition-opacity hover:bg-red-600 disabled:opacity-50 group-hover:opacity-100"
                    title="Delete"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}

                {/* Alt text indicator badge (non-picker) */}
                {!isPickerMode && item.altText && (
                  <div className="absolute left-1.5 top-1.5 rounded bg-emerald-700/70 px-1 py-0.5 text-[8px] font-medium text-emerald-200 opacity-0 transition-opacity group-hover:opacity-100">
                    ALT
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
