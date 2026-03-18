import type { ReactNode } from "react";

const STEPS = [
  {
    title: "Enter your topic",
    description: "Add a subject and references. AI handles structure and tone.",
    icon: "document",
  },
  {
    title: "AI generates content",
    description: "Get newsletters, blog drafts, and images from one studio.",
    icon: "robot",
  },
  {
    title: "Send or schedule",
    description: "Email and WhatsApp to subscribers. Track opens and clicks.",
    icon: "send",
  },
];

function StepIcon({ type }: { type: string }) {
  const base = "h-6 w-6 text-indigo-600";
  switch (type) {
    case "document":
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 3h6l4 4v11a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z" />
          <path d="M13 3v5h5" />
          <path d="M9 12h6" />
          <path d="M9 16h3" />
        </svg>
      );
    case "robot":
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="8" width="14" height="10" rx="3" />
          <path d="M9 5h6" />
          <path d="M12 5v3" />
          <circle cx="10" cy="12" r="1.2" />
          <circle cx="14" cy="12" r="1.2" />
          <path d="M9 15h6" />
        </svg>
      );
    case "send":
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4l16 8-16 8 3-8-3-8z" />
          <path d="M7 12h5" />
        </svg>
      );
    default:
      return null;
  }
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="space-y-10 pt-20 pb-20">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
          How it works
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Three steps from idea to sent.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3 max-w-[1440px] w-full mx-auto">
        {STEPS.map((step, i) => (
          <article
            key={step.title}
            className="group relative rounded-xl border border-slate-800/80 bg-slate-950/70 p-6 shadow-sm transition hover:shadow-[0_18px_50px_rgba(15,23,42,0.9)] hover:border-sky-500/40 backdrop-blur-xl"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
              <StepIcon type={step.icon} />
            </div>
            <span className="text-xs font-medium text-slate-400">Step {i + 1}</span>
            <h3 className="mt-1 text-lg font-semibold text-slate-50">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              {step.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
