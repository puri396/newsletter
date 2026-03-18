"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { NewsletterTemplateStyle } from "@/lib/newsletter/templates";

interface MarkdownPreviewProps {
  markdown: string;
  variant: NewsletterTemplateStyle;
  mode: "thumbnail" | "full";
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function isDarkVariant(variant: NewsletterTemplateStyle): boolean {
  return variant === "posterDark" || variant === "midnightPro" || variant === "boldImpact";
}

function getTextColors(variant: NewsletterTemplateStyle) {
  if (isDarkVariant(variant)) {
    return {
      baseText: "text-slate-100",
      mutedText: "text-slate-300",
      linkText: variant === "boldImpact" ? "text-yellow-300" : "text-indigo-200",
      blockquoteBorder: "border-white/10 bg-white/5 text-slate-200",
      hrColor: "bg-white/10",
      tableBorder: "border-white/10",
      theadColor: "bg-white/5 text-slate-200",
      tbodyColor: "text-slate-200",
      trBorder: "border-t border-white/10",
      imgBorder: "border-white/10",
    };
  }

  if (variant === "sunsetWarm") {
    return {
      baseText: "text-amber-900",
      mutedText: "text-amber-700",
      linkText: "text-orange-600",
      blockquoteBorder: "border-orange-200 bg-orange-50 text-amber-800",
      hrColor: "bg-orange-200",
      tableBorder: "border-orange-200",
      theadColor: "bg-orange-50 text-amber-800",
      tbodyColor: "text-amber-800",
      trBorder: "border-t border-orange-200",
      imgBorder: "border-orange-200",
    };
  }

  if (variant === "mintFresh") {
    return {
      baseText: "text-teal-900",
      mutedText: "text-teal-700",
      linkText: "text-teal-600",
      blockquoteBorder: "border-teal-200 bg-teal-50 text-teal-800",
      hrColor: "bg-teal-200",
      tableBorder: "border-teal-200",
      theadColor: "bg-teal-50 text-teal-800",
      tbodyColor: "text-teal-900",
      trBorder: "border-t border-teal-200",
      imgBorder: "border-teal-200",
    };
  }

  if (variant === "paperTexture") {
    return {
      baseText: "text-stone-800",
      mutedText: "text-stone-600",
      linkText: "text-stone-700",
      blockquoteBorder: "border-stone-300 bg-stone-100 text-stone-700",
      hrColor: "bg-stone-300",
      tableBorder: "border-stone-300",
      theadColor: "bg-stone-100 text-stone-700",
      tbodyColor: "text-stone-700",
      trBorder: "border-t border-stone-300",
      imgBorder: "border-stone-300",
    };
  }

  // formalLetter + infographicBlue (light defaults)
  return {
    baseText: "text-slate-800",
    mutedText: "text-slate-600",
    linkText: "text-blue-700",
    blockquoteBorder: "border-slate-200 bg-slate-50 text-slate-700",
    hrColor: "bg-slate-200",
    tableBorder: "border-white/10",
    theadColor: "bg-slate-100 text-slate-700",
    tbodyColor: "text-slate-700",
    trBorder: "border-t border-slate-200",
    imgBorder: "border-slate-200",
  };
}

export function MarkdownPreview({ markdown, variant, mode }: MarkdownPreviewProps) {
  const isThumb = mode === "thumbnail";
  const colors = getTextColors(variant);
  const proseSpacing = isThumb ? "space-y-2" : "space-y-3";

  return (
    <div className={cx(colors.baseText, proseSpacing, "text-sm leading-relaxed")}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => (
            <h2
              className={cx(
                colors.baseText,
                isThumb ? "text-sm" : "text-base",
                "font-semibold tracking-tight",
              )}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className={cx(
                colors.baseText,
                isThumb ? "text-xs" : "text-sm",
                "font-semibold",
              )}
            >
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className={cx(isThumb ? "text-[12px]" : "text-sm", colors.baseText)}>
              {children}
            </p>
          ),
          em: ({ children }) => (
            <em className={cx(colors.mutedText, "italic")}>{children}</em>
          ),
          strong: ({ children }) => (
            <strong className={cx(colors.baseText, "font-semibold")}>{children}</strong>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className={cx(
                colors.linkText,
                "underline underline-offset-2 hover:opacity-90",
              )}
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className={cx("list-disc pl-5", colors.mutedText, isThumb ? "text-[12px]" : "text-sm")}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className={cx("list-decimal pl-5", colors.mutedText, isThumb ? "text-[12px]" : "text-sm")}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className={cx(isThumb ? "my-0.5" : "my-1")}>{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote
              className={cx(
                "rounded-lg border px-3 py-2",
                colors.blockquoteBorder,
              )}
            >
              <div className={cx(isThumb ? "text-[12px]" : "text-sm")}>
                {children}
              </div>
            </blockquote>
          ),
          hr: () => (
            <div className={cx("h-px w-full", colors.hrColor)} />
          ),
          table: ({ children }) => (
            <div className={cx("overflow-hidden rounded-lg border", colors.tableBorder)}>
              <table className="w-full border-collapse text-left">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className={cx(colors.theadColor)}>
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className={cx(colors.tbodyColor)}>
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className={cx(colors.trBorder)}>{children}</tr>
          ),
          th: ({ children }) => (
            <th className={cx("px-3 py-2 text-[11px] font-semibold")}>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className={cx("px-3 py-2 text-[11px]")}>{children}</td>
          ),
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src ?? ""}
              alt={alt ?? ""}
              className={cx(
                "w-full rounded-md border object-cover",
                colors.imgBorder,
              )}
              style={{ maxHeight: isThumb ? 90 : 220 }}
            />
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
