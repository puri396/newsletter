"use client";

import type { NewsletterTemplateStyle } from "@/lib/newsletter/templates";
import { NewsletterTemplatePreview } from "@/components/newsletter/preview/NewsletterTemplatePreview";

type SupportedContentType = "newsletter" | "blog" | "image" | "video";

export interface ContentRendererProps {
  contentType: SupportedContentType | null | undefined;
  title: string;
  description?: string | null;
  body: string;
  tags?: string[];
  bannerImageUrl?: string | null;
  logoUrl?: string | null;
  templateStyle?: NewsletterTemplateStyle | null;
  mode?: "full" | "thumbnail";
}

const DEFAULT_STYLE: NewsletterTemplateStyle = "posterDark";

export function ContentRenderer({
  contentType,
  title,
  description,
  body,
  tags = [],
  bannerImageUrl,
  logoUrl,
  templateStyle,
  mode = "full",
}: ContentRendererProps) {
  const style = (templateStyle ?? DEFAULT_STYLE) as NewsletterTemplateStyle;

  if (contentType === "image" || contentType === "video") {
    return (
      <div className="space-y-3">
        {bannerImageUrl ? (
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bannerImageUrl}
              alt={title}
              className="w-full object-cover"
            />
          </div>
        ) : null}
        <div className="space-y-1 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
          <h2 className="text-base font-semibold text-zinc-50">{title}</h2>
          {description ? (
            <p className="text-sm text-zinc-400">{description}</p>
          ) : null}
          {body ? (
            <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-200">
              {body}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  // Newsletter / blog rendering shares the same visual system as the editor preview.
  return (
    <NewsletterTemplatePreview
      title={title}
      description={description ?? undefined}
      body={body}
      bannerImageUrl={bannerImageUrl ?? undefined}
      logoUrl={logoUrl ?? undefined}
      tags={tags}
      style={style}
      mode={mode === "thumbnail" ? "thumbnail" : "full"}
    />
  );
}

