"use client";

import React from "react";
import type { NewsletterTemplateStyle } from "@/lib/newsletter/templates";
import { MarkdownPreview } from "./MarkdownPreview";

type PreviewMode = "thumbnail" | "full";

interface NewsletterTemplatePreviewProps {
  title: string;
  description?: string;
  body: string;
  bannerImageUrl?: string | null;
  logoUrl?: string | null;
  tags?: string[];
  style: NewsletterTemplateStyle;
  mode: PreviewMode;
}

function isHtmlContent(content: string): boolean {
  return /<[a-z][\s\S]*>/i.test(content.trim());
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function isDarkStyle(style: NewsletterTemplateStyle): boolean {
  return style === "posterDark" || style === "midnightPro" || style === "boldImpact";
}

function chipClasses(style: NewsletterTemplateStyle) {
  if (style === "formalLetter" || style === "infographicBlue") {
    return "border-slate-200 bg-slate-50 text-slate-700";
  }
  if (style === "mintFresh") return "border-teal-200 bg-teal-50 text-teal-700";
  if (style === "sunsetWarm") return "border-orange-200 bg-orange-50 text-orange-700";
  if (style === "paperTexture") return "border-stone-300 bg-stone-100 text-stone-600";
  // dark styles: posterDark, midnightPro, boldImpact
  if (style === "boldImpact") return "border-yellow-400/30 bg-yellow-400/10 text-yellow-300";
  if (style === "midnightPro") return "border-blue-700/40 bg-blue-900/30 text-blue-200";
  return "border-white/10 bg-white/5 text-slate-100";
}

function frameClasses(style: NewsletterTemplateStyle) {
  if (style === "infographicBlue") {
    return {
      outer: "bg-white",
      inner: "bg-gradient-to-b from-white to-slate-50 border border-slate-200",
    };
  }
  if (style === "formalLetter") {
    return {
      outer:
        "bg-[linear-gradient(90deg,rgba(15,23,42,0.15)_0,rgba(15,23,42,0.15)_8px,transparent_8px,transparent_18px)] bg-[length:18px_18px] bg-slate-200/40",
      inner: "bg-white border border-slate-200",
    };
  }
  if (style === "mintFresh") {
    return {
      outer: "bg-gradient-to-br from-teal-50 via-emerald-50 to-white",
      inner: "bg-white border border-teal-200",
    };
  }
  if (style === "sunsetWarm") {
    return {
      outer: "bg-gradient-to-br from-amber-100 via-orange-50 to-rose-50",
      inner: "bg-white/90 border border-orange-200",
    };
  }
  if (style === "midnightPro") {
    return {
      outer:
        "bg-[radial-gradient(circle_at_top_left,rgba(30,64,175,0.35)_0,transparent_55%),radial-gradient(circle_at_bottom_right,rgba(67,56,202,0.3)_0,transparent_55%)] bg-slate-950",
      inner: "bg-blue-950/80 border border-blue-800/40",
    };
  }
  if (style === "paperTexture") {
    return {
      outer:
        "bg-[linear-gradient(0deg,rgba(180,160,120,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(180,160,120,0.18)_1px,transparent_1px)] bg-[size:20px_20px] bg-stone-200",
      inner: "bg-amber-50 border border-stone-300",
    };
  }
  if (style === "boldImpact") {
    return {
      outer: "bg-black border-t-4 border-yellow-400",
      inner: "bg-zinc-950 border border-yellow-400/20",
    };
  }
  // posterDark fallback
  return {
    outer:
      "bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.25)_0,_transparent_55%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.22)_0,_transparent_55%)] bg-slate-950",
    inner: "bg-slate-950 border border-white/10",
  };
}

function titleClasses(style: NewsletterTemplateStyle, mode: PreviewMode) {
  const isThumb = mode === "thumbnail";
  if (style === "formalLetter" || style === "infographicBlue") {
    return cx(isThumb ? "text-sm" : "text-xl", "font-semibold tracking-tight text-slate-900");
  }
  if (style === "mintFresh") {
    return cx(isThumb ? "text-sm" : "text-xl", "font-semibold tracking-tight text-teal-900");
  }
  if (style === "sunsetWarm") {
    return cx(isThumb ? "text-sm" : "text-xl", "font-semibold tracking-tight text-orange-900");
  }
  if (style === "paperTexture") {
    return cx(isThumb ? "text-sm" : "text-xl", "font-semibold tracking-tight text-stone-800");
  }
  if (style === "midnightPro") {
    return cx(isThumb ? "text-sm" : "text-2xl", "font-semibold tracking-tight text-white");
  }
  if (style === "boldImpact") {
    return cx(isThumb ? "text-sm" : "text-2xl", "font-black tracking-tight text-white uppercase");
  }
  // posterDark
  return cx(isThumb ? "text-sm" : "text-2xl", "font-semibold tracking-tight text-white");
}

function descriptionClasses(style: NewsletterTemplateStyle, mode: PreviewMode) {
  const isThumb = mode === "thumbnail";
  if (style === "formalLetter" || style === "infographicBlue") {
    return cx(isThumb ? "text-[12px]" : "text-sm", "text-slate-600");
  }
  if (style === "mintFresh") return cx(isThumb ? "text-[12px]" : "text-sm", "text-teal-700");
  if (style === "sunsetWarm") return cx(isThumb ? "text-[12px]" : "text-sm", "text-amber-700");
  if (style === "paperTexture") return cx(isThumb ? "text-[12px]" : "text-sm", "text-stone-600");
  if (style === "midnightPro") return cx(isThumb ? "text-[12px]" : "text-sm", "text-blue-200");
  if (style === "boldImpact") return cx(isThumb ? "text-[12px]" : "text-sm", "text-yellow-300");
  return cx(isThumb ? "text-[12px]" : "text-sm", "text-slate-300");
}

function BodyContent({
  body,
  style,
  mode,
}: {
  body: string;
  style: NewsletterTemplateStyle;
  mode: PreviewMode;
}) {
  const isHtml = isHtmlContent(body);

  if (isHtml) {
    let textColor = "text-slate-800";
    if (isDarkStyle(style)) textColor = "text-slate-100";
    else if (style === "mintFresh") textColor = "text-teal-900";
    else if (style === "sunsetWarm") textColor = "text-amber-900";
    else if (style === "paperTexture") textColor = "text-stone-800";

    return (
      <div
        className={cx(
          textColor,
          "preview-html-body text-sm leading-relaxed",
          mode === "thumbnail" && "text-[12px]",
        )}
        // Body is Tiptap HTML generated by the user in-app; images are served from /api/media
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: body }}
      />
    );
  }

  return <MarkdownPreview markdown={body} variant={style} mode={mode} />;
}

function getBrandLabel(style: NewsletterTemplateStyle): string {
  if (style === "formalLetter") return "Company Newsletter";
  if (style === "infographicBlue") return "HEALTH NETWORK";
  if (style === "mintFresh") return "FRESH UPDATES";
  if (style === "sunsetWarm") return "LIFESTYLE LETTER";
  if (style === "midnightPro") return "TECH INTELLIGENCE";
  if (style === "paperTexture") return "THE EDITORIAL";
  if (style === "boldImpact") return "BREAKING";
  return "Observing Pride Day Together";
}

function getTopBadge(style: NewsletterTemplateStyle): string | null {
  if (style === "infographicBlue") return "Premium";
  if (style === "posterDark") return "NOTICE";
  if (style === "mintFresh") return "NEW";
  if (style === "sunsetWarm") return "FEATURED";
  if (style === "midnightPro") return "PRO";
  if (style === "boldImpact") return "ALERT";
  return null;
}

function getBadgeClasses(style: NewsletterTemplateStyle): string {
  if (style === "infographicBlue") return "bg-fuchsia-600 text-white";
  if (style === "mintFresh") return "bg-teal-500 text-white";
  if (style === "sunsetWarm") return "bg-orange-500 text-white";
  if (style === "midnightPro") return "bg-blue-600 text-white";
  if (style === "boldImpact") return "bg-yellow-400 text-black font-black";
  return "bg-white/10 text-slate-100 ring-1 ring-white/15";
}

function getFooterClasses(style: NewsletterTemplateStyle) {
  if (isDarkStyle(style)) {
    return {
      divider: style === "boldImpact" ? "bg-yellow-400/20" : "bg-white/10",
      text: style === "boldImpact" ? "text-yellow-400/60" : "text-slate-400",
    };
  }
  if (style === "mintFresh") return { divider: "bg-teal-200", text: "text-teal-600/70" };
  if (style === "sunsetWarm") return { divider: "bg-orange-200", text: "text-amber-600/70" };
  if (style === "paperTexture") return { divider: "bg-stone-300", text: "text-stone-500" };
  return { divider: "bg-slate-200", text: "text-slate-500" };
}

function getBrandLabelClasses(style: NewsletterTemplateStyle): string {
  if (isDarkStyle(style)) {
    if (style === "boldImpact") return "text-yellow-400";
    if (style === "midnightPro") return "text-blue-300";
    return "text-slate-300";
  }
  if (style === "mintFresh") return "text-teal-600";
  if (style === "sunsetWarm") return "text-orange-600";
  if (style === "paperTexture") return "text-stone-500";
  return "text-slate-600";
}

function getBannerBorderClass(style: NewsletterTemplateStyle): string {
  if (style === "formalLetter" || style === "infographicBlue" || style === "mintFresh" || style === "sunsetWarm" || style === "paperTexture") {
    return style === "mintFresh" ? "border border-teal-200" : style === "sunsetWarm" ? "border border-orange-200" : style === "paperTexture" ? "border border-stone-300" : "border border-slate-200";
  }
  if (style === "boldImpact") return "border border-yellow-400/20";
  if (style === "midnightPro") return "border border-blue-800/40";
  return "border border-white/10";
}

export function NewsletterTemplatePreview({
  title,
  description,
  body,
  bannerImageUrl,
  logoUrl,
  tags = [],
  style,
  mode,
}: NewsletterTemplatePreviewProps) {
  const isThumb = mode === "thumbnail";
  const frame = frameClasses(style);
  const topBadge = getTopBadge(style);
  const footerClasses = getFooterClasses(style);

  return (
    <div className={cx("w-full overflow-hidden rounded-xl p-3", frame.outer)}>
      <div
        className={cx(
          "relative overflow-hidden rounded-lg",
          frame.inner,
          isThumb ? "p-3" : "p-6",
        )}
      >
        {/* Top badge */}
        {topBadge ? (
          <div className="absolute right-3 top-3">
            <span
              className={cx(
                "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
                getBadgeClasses(style),
              )}
            >
              {topBadge}
            </span>
          </div>
        ) : null}

        {/* Brand row — logo or text */}
        <div className="flex items-center justify-center">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt="Logo"
              className="object-contain"
              style={{ maxHeight: isThumb ? 28 : 40, maxWidth: isThumb ? 80 : 140 }}
            />
          ) : (
            <p
              className={cx(
                "text-[10px] font-semibold tracking-[0.18em] uppercase",
                getBrandLabelClasses(style),
              )}
            >
              {getBrandLabel(style)}
            </p>
          )}
        </div>

        {/* Optional banner */}
        {bannerImageUrl ? (
          <div className={cx(isThumb ? "mt-3" : "mt-4")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bannerImageUrl}
              alt=""
              className={cx("w-full rounded-md object-cover", getBannerBorderClass(style))}
              style={{ maxHeight: isThumb ? 90 : 220 }}
            />
          </div>
        ) : null}

        {/* Title + description */}
        <div className={cx(isThumb ? "mt-3" : "mt-5", "text-center")}>
          <h3 className={titleClasses(style, mode)}>{title}</h3>
          {description ? (
            <p className={cx("mt-1", descriptionClasses(style, mode))}>{description}</p>
          ) : null}
        </div>

        {/* Tags chips */}
        {tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {tags.slice(0, isThumb ? 3 : 6).map((tag) => (
              <span
                key={tag}
                className={cx(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                  chipClasses(style),
                )}
              >
                #{tag}
              </span>
            ))}
            {tags.length > (isThumb ? 3 : 6) ? (
              <span
                className={cx(
                  "text-[10px]",
                  isDarkStyle(style) ? "text-slate-400" : "text-slate-500",
                )}
              >
                +{tags.length - (isThumb ? 3 : 6)} more
              </span>
            ) : null}
          </div>
        ) : null}

        {/* Body layout — varies by style */}
        <div
          className={cx(
            isThumb ? "mt-4" : "mt-6",
            isThumb && "max-h-[140px] overflow-hidden",
          )}
        >
          {style === "infographicBlue" || style === "mintFresh" ? (
            <div className={cx("grid gap-2", isThumb ? "grid-cols-1" : "grid-cols-2")}>
              <div
                className={cx(
                  "min-w-0 overflow-hidden rounded-lg border p-3",
                  style === "mintFresh"
                    ? "border-teal-200 bg-white"
                    : "border-slate-200 bg-white",
                )}
              >
                <BodyContent body={body} style={style} mode={mode} />
              </div>
              {!isThumb ? (
                <div
                  className={cx(
                    "min-w-0 overflow-hidden rounded-lg border p-3",
                    style === "mintFresh"
                      ? "border-teal-200 bg-teal-50/50"
                      : "border-slate-200 bg-white",
                  )}
                >
                  <div
                    className={cx(
                      "text-[11px] font-semibold",
                      style === "mintFresh" ? "text-teal-700" : "text-slate-700",
                    )}
                  >
                    Quick scan
                  </div>
                  <div className="mt-2 space-y-2 text-[11px] text-slate-600">
                    <div
                      className={cx(
                        "rounded-md px-2 py-1",
                        style === "mintFresh" ? "bg-teal-50" : "bg-slate-50",
                      )}
                    >
                      Clean spacing and blocks
                    </div>
                    <div
                      className={cx(
                        "rounded-md px-2 py-1",
                        style === "mintFresh" ? "bg-teal-50" : "bg-slate-50",
                      )}
                    >
                      Headings + lists styled
                    </div>
                    <div
                      className={cx(
                        "rounded-md px-2 py-1",
                        style === "mintFresh" ? "bg-teal-50" : "bg-slate-50",
                      )}
                    >
                      Looks great on mobile
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : style === "formalLetter" || style === "sunsetWarm" || style === "paperTexture" ? (
            <div className="min-w-0 overflow-hidden px-1">
              <BodyContent body={body} style={style} mode={mode} />
            </div>
          ) : (
            // posterDark, midnightPro, boldImpact — centered max-width column
            <div className="mx-auto min-w-0 max-w-[560px] overflow-hidden">
              <BodyContent body={body} style={style} mode={mode} />
            </div>
          )}
        </div>

        {/* Footer line */}
        <div className={cx(isThumb ? "mt-4" : "mt-6")}>
          <div className={cx("h-px w-full", footerClasses.divider)} />
          <div
            className={cx(
              "mt-2 flex items-center justify-between text-[10px]",
              footerClasses.text,
            )}
          >
            <span>Preview</span>
            <span>{new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
