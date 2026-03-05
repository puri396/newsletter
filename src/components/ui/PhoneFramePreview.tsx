"use client";

export type PhoneFrameMode = "hook" | "script" | "caption";

interface PhoneFramePreviewProps {
  mode: PhoneFrameMode;
  content: string;
  /** Optional label for the current mode (e.g. "Hook", "Reel script") */
  modeLabel?: string;
}

const MODE_LABELS: Record<PhoneFrameMode, string> = {
  hook: "Hook",
  script: "Reel script",
  caption: "Caption",
};

export function PhoneFramePreview({
  mode,
  content,
  modeLabel,
}: PhoneFramePreviewProps) {
  const label = modeLabel ?? MODE_LABELS[mode];
  const displayContent = content.trim() || "No content for this view.";

  return (
    <div className="flex flex-col items-center">
      {/* Phone frame: ~9:19.5 aspect ratio, rounded corners */}
      <div
        className="relative w-full max-w-[280px] overflow-hidden rounded-[2.25rem] border-[10px] border-zinc-800 bg-zinc-900 shadow-xl"
        style={{ aspectRatio: "9 / 19.5" }}
        aria-label={`Mobile preview: ${label}`}
      >
        {/* Notch */}
        <div className="absolute left-1/2 top-0 z-10 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-zinc-950" />

        {/* Scrollable viewport */}
        <div className="flex h-full flex-col pt-6">
          <div className="px-2 pb-2 text-center">
            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              {label}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-6">
            <div
              className="min-h-full text-sm leading-relaxed text-zinc-100"
              style={{ wordBreak: "break-word" }}
            >
              {mode === "script" ? (
                <p className="whitespace-pre-wrap font-sans">{displayContent}</p>
              ) : (
                <p className="whitespace-pre-wrap font-sans">{displayContent}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
