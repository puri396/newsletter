import { SubscribeForm } from "./SubscribeForm";

export const metadata = {
  title: "Subscribe | Orion Newsletter",
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Hero */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/30">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
            Orion Newsletter
          </h1>
          <p className="mt-3 text-lg text-zinc-400 max-w-xl mx-auto">
            Get the latest updates and insights delivered to your inbox. One
            subscription, zero noise.
          </p>
        </div>
      </header>

      {/* Benefits + Form */}
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-5 lg:gap-12">
          <section
            className="lg:col-span-3 space-y-6"
            aria-labelledby="benefits-heading"
          >
            <h2 id="benefits-heading" className="text-xl font-semibold text-zinc-50">
              Why subscribe?
            </h2>
            <ul className="space-y-4">
              {benefits.map((b, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 text-sm font-medium"
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <div>
                    <span className="font-medium text-zinc-200">{b.title}</span>
                    <span className="text-zinc-400"> — {b.description}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section
            className="lg:col-span-2"
            aria-labelledby="subscribe-heading"
          >
            <h2 id="subscribe-heading" className="text-xl font-semibold text-zinc-50 mb-4">
              Get the newsletter
            </h2>
            <SubscribeForm />
          </section>
        </div>
      </main>

      <footer className="border-t border-zinc-800/80 py-6 text-center text-sm text-zinc-500">
        <p>Orion Newsletter · Unsubscribe anytime from every email.</p>
      </footer>
    </div>
  );
}
