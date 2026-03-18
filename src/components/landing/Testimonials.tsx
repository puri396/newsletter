const TESTIMONIALS = [
  {
    quote:
      "We replaced three tools with one studio. Draft, approve, and send across email + WhatsApp without messy spreadsheets.",
    name: "Anika",
    title: "Growth Lead",
  },
  {
    quote:
      "The EPIC view makes it easy to iterate. AI gets us 80% there, and the editor makes the last mile fast.",
    name: "Ravi",
    title: "Founder",
  },
  {
    quote:
      "Subscriber management is simple and transparent. Opt-in for WhatsApp is clear, and we can broadcast when it matters.",
    name: "Maya",
    title: "Product Marketing",
  },
];

function QuoteMark() {
  return (
    <svg
      className="h-5 w-5 text-fuchsia-400/80"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M7.17 6.17A6 6 0 0 0 3 12v6h6v-6H6.12a4 4 0 0 1 3.88-4V6h-.83ZM18.17 6.17A6 6 0 0 0 14 12v6h6v-6h-2.88a4 4 0 0 1 3.88-4V6h-.83Z" />
    </svg>
  );
}

export function Testimonials() {
  return (
    <section id="testimonials" className="space-y-8 text-center">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold text-slate-50 sm:text-3xl">
          Loved by teams shipping updates
        </h2>
        <p className="text-sm text-slate-300">
          Social proof that stays focused on outcomes: faster publishing and clearer delivery.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <figure
            key={t.name}
            className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:shadow-md hover:border-fuchsia-100"
          >
            <div className="mb-4 flex items-center gap-2">
              <QuoteMark />
              <div className="h-px flex-1 bg-gradient-to-r from-fuchsia-300/50 via-indigo-300/30 to-transparent" />
            </div>
            <blockquote className="text-sm text-slate-700 leading-relaxed">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-5">
              <div className="text-sm font-semibold text-slate-900">{t.name}</div>
              <div className="text-xs text-slate-500">{t.title}</div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

