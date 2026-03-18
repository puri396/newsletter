"use client";

import { useState } from "react";

interface CopyableUrlProps {
  url: string;
  label?: string;
}

export function CopyableUrl({ url, label = "URL" }: CopyableUrlProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <code className="rounded bg-zinc-800/80 px-2 py-1 text-sm text-zinc-300 break-all">
        {url}
      </code>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={label}
        className="rounded border border-zinc-600 bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-200 hover:bg-zinc-700"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
