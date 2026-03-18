const INTEGRATIONS = [
  {
    name: "Resend",
    description: "Send beautiful emails reliably with modern deliverability tooling.",
    badge: "Email",
  },
  {
    name: "Meta WhatsApp Cloud API",
    description: "Broadcast updates to opted-in subscribers with template messages.",
    badge: "WhatsApp",
  },
  {
    name: "Prisma + Postgres",
    description: "Store subscribers, campaigns, and delivery logs with a clean data model.",
    badge: "Data",
  },
];

function Badge({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
      {children}
    </span>
  );
}

export function Integrations() {
  return (
    <section id="integrations" className="space-y-8 text-center pt-20 pb-20">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">
          Connect the channels you need
        </h2>
        <p className="text-sm text-slate-600">
          Start with email, add WhatsApp when you’re ready. GenContent AI is designed to be API-first.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3">
        {INTEGRATIONS.map((item) => (
          <article
            key={item.name}
            className="relative flex flex-col rounded-3xl border border-slate-200 bg-white px-6 py-6 text-left text-sm shadow-sm transition hover:-translate-y-1 hover:border-indigo-100 hover:shadow-lg"
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/3 via-fuchsia-500/3 to-sky-400/3 opacity-0 transition-opacity duration-200 hover:opacity-100" />
            <div className="relative flex items-start justify-between gap-4">
              <h3 className="text-sm font-semibold text-slate-900">{item.name}</h3>
              <Badge>{item.badge}</Badge>
            </div>
            <p className="relative mt-3 text-slate-600 leading-relaxed">
              {item.description}
            </p>
            <p className="relative mt-4 text-[11px] text-slate-500">
              Configure with environment variables. No vendor lock-in.
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

