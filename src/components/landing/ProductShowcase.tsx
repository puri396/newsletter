"use client";

import { useState, useEffect, useRef } from "react";

const DURATION_MS = 4500;

const SLIDES = [
  {
    id: "newsletter",
    label: "Newsletter Creator",
    tagline: "From idea to inbox in seconds",
    description:
      "Generate personalized newsletter campaigns with AI. Tone, CTAs, and structure adapt automatically per audience segment — send-ready in under a minute.",
    gradient: "from-indigo-500 to-fuchsia-500",
    borderColor: "border-indigo-400/50",
    glowColor: "rgba(129,140,248,0.4)",
    dotColor: "bg-indigo-400",
    barColor: "bg-indigo-400",
  },
  {
    id: "blog",
    label: "Blog Post Generator",
    tagline: "SEO-ready content, instantly",
    description:
      "Write long-form blog posts with AI-generated titles, meta descriptions, and keyword placement. Publish-ready drafts in minutes, not hours.",
    gradient: "from-fuchsia-500 to-sky-500",
    borderColor: "border-fuchsia-400/50",
    glowColor: "rgba(217,70,239,0.35)",
    dotColor: "bg-fuchsia-400",
    barColor: "bg-fuchsia-400",
  },
  {
    id: "image",
    label: "AI Image Generation",
    tagline: "Unique visuals for every campaign",
    description:
      "Generate on-brand images from a single prompt. Style-consistent visuals that match your newsletters and blog posts, automatically.",
    gradient: "from-sky-400 to-emerald-400",
    borderColor: "border-sky-400/50",
    glowColor: "rgba(56,189,248,0.35)",
    dotColor: "bg-sky-400",
    barColor: "bg-sky-400",
  },
  {
    id: "analytics",
    label: "Campaign Analytics",
    tagline: "Know exactly what resonates",
    description:
      "Real-time open rates, click-through data, and AI-powered insights to help you improve every campaign. Track performance across email and WhatsApp.",
    gradient: "from-emerald-400 to-indigo-500",
    borderColor: "border-emerald-400/50",
    glowColor: "rgba(52,211,153,0.35)",
    dotColor: "bg-emerald-400",
    barColor: "bg-emerald-400",
  },
] as const;

type SlideId = (typeof SLIDES)[number]["id"];

// ─── Slide Preview Mockups ───────────────────────────────────────────────────

function NewsletterMockup() {
  return (
    <div className="space-y-3 text-xs">
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2.5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <span className="text-slate-500">To:</span>
          <span className="font-medium text-slate-900">Weekly Digest — 3,420 subscribers</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Subject:</span>
          <span className="text-indigo-200 font-medium">🚀 This Week in AI</span>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-3">
        <div className="h-2.5 w-2/5 rounded-full bg-indigo-500/70" />
        <div className="space-y-1.5">
          <div className="h-2 w-full rounded-full bg-slate-700/70" />
          <div className="h-2 w-11/12 rounded-full bg-slate-700/60" />
          <div className="h-2 w-10/12 rounded-full bg-slate-700/50" />
        </div>
        <div className="flex gap-3">
          <div className="h-16 w-20 flex-shrink-0 rounded-lg border border-slate-200 bg-gradient-to-br from-indigo-100 to-fuchsia-100" />
          <div className="flex-1 space-y-1.5 pt-1">
            <div className="h-2 w-full rounded-full bg-slate-200" />
            <div className="h-2 w-10/12 rounded-full bg-slate-200" />
            <div className="h-2 w-8/12 rounded-full bg-slate-200" />
          </div>
        </div>
        <div className="flex items-center gap-2.5 pt-1">
          <div className="rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm">
            Read More →
          </div>
          <span className="text-[10px] text-slate-500">AI-personalised CTA</span>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
        <span className="text-slate-500">Ready to send</span>
        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
          ✓ Reviewed by AI
        </span>
      </div>
    </div>
  );
}

function BlogMockup() {
  return (
    <div className="space-y-3 text-xs">
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Blog Draft</span>
          <span className="rounded-full bg-fuchsia-50 px-2.5 py-0.5 text-[11px] font-medium text-fuchsia-700">
            SEO: 82 / 100
          </span>
        </div>
        <div className="rounded-lg bg-slate-50 p-2.5 text-[12px] font-medium text-slate-900">
          10 AI Productivity Tips for Remote Teams
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-fuchsia-500 to-sky-500" />
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
        <div className="h-2.5 w-1/4 rounded-full bg-fuchsia-400/70" />
        <div className="space-y-1.5">
          <div className="h-2 w-full rounded-full bg-slate-200" />
          <div className="h-2 w-11/12 rounded-full bg-slate-200" />
          <div className="h-2 w-9/12 rounded-full bg-slate-200" />
          <div className="h-2 w-full rounded-full bg-slate-200" />
          <div className="h-2 w-10/12 rounded-full bg-slate-200" />
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {["#AI", "#Productivity", "#Remote", "#Teams"].map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ImageMockup() {
  return (
    <div className="space-y-3 text-xs">
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-sky-400" />
          <span className="text-slate-500">Prompt</span>
        </div>
        <div className="rounded-lg bg-slate-50 p-2.5 text-[12px] leading-relaxed text-slate-800">
          "Newsletter header for an AI startup, modern minimalist blue gradient style"
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Generated results</span>
          <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-medium text-sky-700">
            4 variations
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ["from-indigo-500/50 to-sky-500/40", true],
              ["from-sky-500/40 to-emerald-500/30", false],
              ["from-fuchsia-500/40 to-indigo-500/30", false],
              ["from-sky-400/40 to-fuchsia-500/30", false],
            ] as [string, boolean][]
          ).map(([gradient, selected], i) => (
            <div
              key={i}
              className={`flex h-16 items-center justify-center rounded-lg border bg-gradient-to-br ${gradient} ${
                selected
                  ? "border-sky-300 shadow-sm"
                  : "border-slate-200"
              }`}
            >
              {selected && (
                <span className="text-[10px] font-semibold text-sky-900">
                  Selected ✓
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalyticsMockup() {
  const bars = [45, 62, 53, 78, 67, 84, 71];
  return (
    <div className="space-y-3 text-xs">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Open Rate", value: "68.2%", change: "↑ 4.1%", color: "text-emerald-600" },
          { label: "Click Rate", value: "12.4%", change: "↑ 1.8%", color: "text-sky-600" },
          { label: "New Subs", value: "+243", change: "this week", color: "text-indigo-600" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="space-y-0.5 rounded-xl border border-slate-200 bg-white p-2.5 text-center"
          >
            <div className={`text-base font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] text-slate-500">{stat.label}</div>
            <div className="text-[10px] text-emerald-600/80">{stat.change}</div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-3">
        <div className="text-slate-600">Open rate — last 7 campaigns</div>
        <div className="flex items-end gap-1.5 h-14">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-gradient-to-t from-emerald-500/60 to-indigo-500/60"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-slate-600">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function SlidePreview({ id }: { id: SlideId }) {
  switch (id) {
    case "newsletter":
      return <NewsletterMockup />;
    case "blog":
      return <BlogMockup />;
    case "image":
      return <ImageMockup />;
    case "analytics":
      return <AnalyticsMockup />;
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function ProductShowcase() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const activeIdxRef = useRef(activeIdx);
  activeIdxRef.current = activeIdx;

  const goTo = (idx: number) => {
    setVisible(false);
    setProgress(0);
    setTimeout(() => {
      setActiveIdx(idx);
      setVisible(true);
    }, 180);
  };

  // Auto-advance
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = (activeIdxRef.current + 1) % SLIDES.length;
      goTo(next);
    }, DURATION_MS);
    return () => clearTimeout(timer);
  }, [activeIdx]);

  // Progress bar tick
  useEffect(() => {
    setProgress(0);
    const step = 100 / (DURATION_MS / 40);
    const ticker = setInterval(() => {
      setProgress((p) => Math.min(p + step, 100));
    }, 40);
    return () => clearInterval(ticker);
  }, [activeIdx]);

  const slide = SLIDES[activeIdx];

  return (
    <section
      id="product-showcase"
      className="relative pt-6 pb-6 bg-slate-950 overflow-hidden"
      style={{
        backgroundColor: "#e4f1eb",
      }}  
    >
      <div className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[420px] bg-gradient-to-tr from-sky-500/30 via-emerald-400/25 to-cyan-500/30 blur-3xl" />
      {/* Header */}
      <div className="space-y-3 text-center pt-5 pb-5 ">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
          See it in action
        </div>
        <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          Everything you need in{" "}
          <span className="bg-gradient-to-r from-sky-400 via-emerald-300 to-cyan-400  bg-clip-text text-transparent">
            one studio
          </span>
        </h2>
        <p className="text-sm text-slate-600">
          From newsletters to blog posts to images and analytics — all powered by AI.
        </p>
      </div>

      {/* Tab Pills */}
      <div className="flex flex-wrap justify-center gap-2  max-w-[1440px] w-full mx-auto mt-5 mb-5">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => { if (i !== activeIdx) goTo(i); }}
            className={[
              "relative rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200",
              i === activeIdx
                ? `bg-gradient-to-r ${s.gradient} text-white shadow-[0_0_22px_${s.glowColor}]`
                : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900",
            ].join(" ")}
          >
            {s.label}
            {/* Progress bar underneath active tab */}
            {i === activeIdx && (
              <span
                className="absolute bottom-0 left-0 h-[2px] rounded-full bg-white/50 transition-none"
                style={{ width: `${progress}%` }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Slide Content */}
      <div
        className="grid gap-10 md:grid-cols-2 md:items-center  max-w-[1440px] w-full mx-auto mt-5 pb-5 pt-5"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.18s ease, transform 0.18s ease",
        }}
      >
        {/* Left — Text */}
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
            <span className={`h-1.5 w-1.5 rounded-full ${slide.dotColor}`} />
            {slide.tagline}
          </div>

          <h3 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
            {slide.label}
          </h3>

          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
            {slide.description}
          </p>

          {/* Dot navigation */}
          <div className="flex items-center gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { if (i !== activeIdx) goTo(i); }}
                className={[
                  "h-1.5 rounded-full transition-all duration-300",
                  i === activeIdx
                    ? `w-7 bg-gradient-to-r ${slide.gradient}`
                    : "w-3 bg-slate-200 hover:bg-slate-300",
                ].join(" ")}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Right — Mockup */}
        <div className="relative">
          <div
            className={`relative rounded-2xl border ${slide.borderColor} bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.12)]`}
          >
            {/* Mock window bar */}
            <div className="mb-4 flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
              </div>
              <div className="mx-auto flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-[11px] text-slate-500">
                <span className={`h-1.5 w-1.5 rounded-full ${slide.dotColor}`} />
                {slide.label}
              </div>
              <span className="text-[10px] text-slate-500">AI-powered</span>
            </div>

            <SlidePreview id={slide.id} />
          </div>
        </div>
      </div>
    </section>
  );
}
