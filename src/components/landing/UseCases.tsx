const USE_CASES = [
  {
    title: "Marketing teams",
    description: "Ship product updates and nurture sequences from one studio. Email and WhatsApp in one place.",
    icon: "megaphone",
  },
  {
    title: "Content creators",
    description: "Turn ideas into newsletters and blog posts with AI. Keep a consistent voice without the copy grind.",
    icon: "pen",
  },
  {
    title: "SaaS and startups",
    description: "Onboard users, share release notes, and re-engage with personalized content and images.",
    icon: "rocket",
  },
];

function UseCaseIcon({ type }: { type: string }) {
  const base = "h-6 w-6 text-indigo-600";
  if (type === "megaphone")
    return (
      <svg className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 11 18-5v12L3 14v-3z" />
        <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
      </svg>
    );
  if (type === "pen")
    return (
      <svg className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      </svg>
    );
  if (type === "rocket")
    return (
      <svg className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      </svg>
    );
  return null;
}

export function UseCases() {
  return (
    <section id="use-cases" className="space-y-8 text-center">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          Built for the teams who ship content
        </h2>
        <p className="text-sm text-slate-600">
          Whether you run marketing, create content, or grow a product, ContentPilot keeps everyone in the same studio.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {USE_CASES.map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:shadow-md hover:border-indigo-100"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 ring-1 ring-indigo-100">
              <UseCaseIcon type={item.icon} />
            </div>
            <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
