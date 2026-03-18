"use client";

import { useRef, useState, type FormEvent } from "react";
import { getApiErrorMessage } from "@/lib/api/get-error-message";

type SubmitState = "idle" | "loading" | "success" | "already" | "error";

export function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappOptIn, setWhatsappOptIn] = useState(false);
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const websiteRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setState("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          phone: phone.trim() || undefined,
          whatsappOptIn: whatsappOptIn || undefined,
          website: websiteRef.current?.value ?? "",
        }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (res.status === 201) {
        setState("success");
        setMessage("Thanks for subscribing.");
      } else if (res.status === 200) {
        setState("already");
        setMessage("You're already subscribed.");
      } else {
        setState("error");
        setMessage(getApiErrorMessage(data, data.error ?? "Something went wrong. Please try again."));
      }
    } catch {
      setState("error");
      setMessage("Unable to reach the server. Please try again.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-violet-500/40 bg-slate-950/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.95)]"
      aria-label="Subscribe form"
    >
      {/* Honeypot: hidden from users; bots that fill it get rejected */}
      <div className="absolute -left-[9999px] w-1 h-1 overflow-hidden" aria-hidden>
        <label htmlFor="subscribe-website">Website</label>
        <input
          ref={websiteRef}
          id="subscribe-website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <div>
        <label
          htmlFor="subscribe-email"
          className="block text-sm font-medium text-slate-200"
        >
          Email <span className="text-red-400" aria-hidden>*</span>
        </label>
        <input
          id="subscribe-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
          disabled={state === "loading"}
          autoComplete="email"
        />
      </div>
      <div>
        <label
          htmlFor="subscribe-name"
          className="block text-sm font-medium text-slate-200"
        >
          Name <span className="text-xs text-slate-500">(optional)</span>
        </label>
        <input
          id="subscribe-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
          disabled={state === "loading"}
          autoComplete="name"
        />
      </div>
      <div>
        <label
          htmlFor="subscribe-phone"
          className="block text-sm font-medium text-slate-200"
        >
          Phone <span className="text-xs text-slate-500">(optional, E.164 e.g. +1234567890)</span>
        </label>
        <input
          id="subscribe-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1234567890"
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
          disabled={state === "loading"}
          autoComplete="tel"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="subscribe-whatsapp"
          type="checkbox"
          checked={whatsappOptIn}
          onChange={(e) => setWhatsappOptIn(e.target.checked)}
          disabled={state === "loading"}
          className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-violet-500 focus:ring-violet-400"
        />
        <label htmlFor="subscribe-whatsapp" className="text-sm text-slate-200">
          Receive WhatsApp updates (phone required)
        </label>
      </div>
      <button
        type="submit"
        disabled={state === "loading"}
        className="w-full rounded-md bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-400 px-4 py-2.5 text-sm font-medium text-slate-50 shadow-[0_0_25px_rgba(129,140,248,0.9)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state === "loading" ? "Subscribing…" : "Subscribe"}
      </button>
      {message ? (
        <p
          role="alert"
          className={`text-sm ${
            state === "error"
              ? "text-red-400"
              : state === "success" || state === "already"
                ? "text-emerald-400"
                : "text-zinc-400"
          }`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
