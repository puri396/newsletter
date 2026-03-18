import { SubscribeForm } from "./SubscribeForm";

export const metadata = {
  title: "Subscribe | GenContent AI",
  description:
    "Subscribe to our newsletter for updates and insights. No spam, unsubscribe anytime.",
};

const benefits = [
  {
    title: "Curated insights",
    description: "Weekly digests and analysis you won’t find elsewhere.",
  },
  {
    title: "No spam",
    description: "Only valuable content. Unsubscribe in one click anytime.",
  },
  {
    title: "Respects your inbox",
    description: "One or two emails per week, at a pace that works for you.",
  },
];

export default function SubscribePage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-[-40%] top-[-25%] h-[420px] bg-[radial-gradient(circle_at_top,_#7c3aed_0,_transparent_60%)] opacity-70" />
        <div className="absolute inset-x-[-40%] bottom-[-25%] h-[460px] bg-[radial-gradient(circle_at_bottom,_#ec4899_0,_transparent_60%)] opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(148,163,184,0.3)_0,_transparent_55%)] opacity-50 mix-blend-screen" />
      </div>

      {/* Hero */}
      <header className="border-b border-violet-500/40 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-4 py-10 text-center sm:py-14">
          <h1 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
            GenContent AI
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-lg text-slate-300">
            Get the latest updates and insights delivered to your inbox. One
            subscription, zero noise.
          </p>
        </div>
      </header>

      {/* Benefits + Form */}
      <main className="mx-auto flex w-full flex-1 max-w-4xl px-4 py-10 sm:py-14">
        <div className="grid w-full gap-10 lg:grid-cols-5 lg:gap-12">
          <section
            className="space-y-6 lg:col-span-3"
            aria-labelledby="benefits-heading"
          >
            <h2
              id="benefits-heading"
              className="text-xl font-semibold text-slate-50"
            >
              Why subscribe?
            </h2>
            <ul className="space-y-4">
              {benefits.map((b, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 text-sm font-medium text-slate-50 shadow-[0_0_18px_rgba(129,140,248,0.9)]"
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <div>
                    <span className="font-medium text-slate-100">
                      {b.title}
                    </span>
                    <span className="text-slate-300"> — {b.description}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section
            className="lg:col-span-2"
            aria-labelledby="subscribe-heading"
          >
            <h2
              id="subscribe-heading"
              className="mb-4 text-xl font-semibold text-slate-50"
            >
              Get the newsletter
            </h2>
            <SubscribeForm />
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-800/80 py-6 text-center text-sm text-slate-400">
        <p>GenContent AI · Unsubscribe anytime from every email.</p>
      </footer>
    </div>
  );
}
