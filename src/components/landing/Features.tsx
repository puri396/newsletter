import type { ReactNode } from "react";

const FEATURES = [
  {
    title: "Content Studio (EPIC)",
    description: "One place to generate and manage newsletters, blogs, images, and videos.",
    gradient: "from-indigo-500 to-sky-400",
    icon: "blog",
  },
  {
    title: "Newsletter Creator",
    description: "Generate engaging email newsletters in seconds from the same studio.",
    gradient: "from-fuchsia-500 to-indigo-500",
    icon: "newsletter",
  },
  {
    title: "SEO Optimization",
    description: "Automatic SEO titles, tags & keywords for every piece.",
    gradient: "from-emerald-400 to-sky-400",
    icon: "seo",
  },
  {
    title: "Image Generation",
    description: "Generate unique images with AI for each campaign.",
    gradient: "from-sky-400 to-purple-500",
    icon: "image",
  },
];

function FeatureIconBubble({
  gradient,
  children,
}: {
  gradient: string;
  children: ReactNode;
}) {
  return (
    <div className="relative mb-3 inline-flex">
      <div
        className={`absolute inset-0 -z-10 rounded-2xl bg-gradient-to-tr ${gradient} opacity-40 blur-lg`}
      />
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white ring-2 ring-indigo-100">
        {children}
      </div>
    </div>
  );
}

function FeatureIcon({ type }: { type: string }) {
  const base = "h-5 w-5 text-indigo-600";
  switch (type) {
    case "blog":
      return (
        <svg
          className={base}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M8 9h8" />
          <path d="M8 13h5" />
          <path d="M8 17h3" />
        </svg>
      );
    case "newsletter":
      return (
        <svg
          className={base}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 8l9 5 9-5" />
        </svg>
      );
    case "seo":
      return (
        <svg
          className={base}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="4" />
          <path d="m15.5 15.5 3 3" />
          <path d="M9 11h1.5" />
          <path d="M11 9v1.5" />
        </svg>
      );
    case "image":
      return (
        <svg
          className={base}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <circle cx="9" cy="10" r="1.4" />
          <path d="m21 16-3.5-3.5a1 1 0 0 0-1.4 0L9 19" />
        </svg>
      );
    default:
      return null;
  }
}

export function Features() {
  return (
    <section id="features" className="space-y-10 text-center text-slate-90 pt-12 pb-12">
      <div className="space-y-3 max-w-[1440px] w-full mx-auto">
        <h2 className="text-2xl font-semibold sm:text-3xl">
          Everything you need in one content studio
        </h2>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto">
          Plan, draft, design, and publish newsletters, blogs, and images in a single AI-powered workspace.
        </p>
      </div>

      <div className="grid gap-6 text-left md:grid-cols-2 max-w-[1440px] w-full mx-auto">
        {FEATURES.map((feature) => (
          <article
            key={feature.title}
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-indigo-100"
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-100 via-fuchsia-100 to-sky-100 opacity-80 blur-2xl" />
            <FeatureIconBubble gradient={feature.gradient}>
              <FeatureIcon type={feature.icon} />
            </FeatureIconBubble>
            <h3 className="relative mt-4 text-base font-semibold text-slate-900">
              {feature.title}
            </h3>
            <p className="relative mt-2 text-sm text-slate-600">
              {feature.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

