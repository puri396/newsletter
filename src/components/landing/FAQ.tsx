"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  { q: "Do I need to connect my own email or WhatsApp?", a: "Yes. For email we use Resend; for WhatsApp you add Meta Cloud API credentials. Both are optional; you can start with email only." },
  { q: "Can I send the same newsletter by email and WhatsApp?", a: "Yes. When you publish, it can go to email subscribers and to WhatsApp-opted-in subscribers. You can also trigger a WhatsApp-only broadcast from the Content Studio." },
  { q: "How does the AI content generation work?", a: "You enter a topic, tone, and optional reference links. The studio uses AI to generate a draft. You edit and then send or schedule. Image generation is available for banners." },
  { q: "Is there a free tier?", a: "You can run the app yourself and use your own API keys. Pricing for Resend, Meta WhatsApp, and AI providers depends on their plans." },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="space-y-8 text-center pb-10">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold text-slate-50 sm:text-3xl">Frequently asked questions</h2>
        <p className="text-sm text-slate-300">Quick answers to common questions.</p>
      </div>
      <div className="mx-auto max-w-2xl space-y-2 text-left">
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-slate-900 hover:bg-slate-50 transition"
            >
              {item.q}
              <span className="ml-2 shrink-0 text-slate-400">
                {openIndex === i ? "−" : "+"}
              </span>
            </button>
            {openIndex === i && (
              <div className="border-t border-slate-200 px-5 py-4">
                <p className="text-sm leading-relaxed text-slate-600">{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
