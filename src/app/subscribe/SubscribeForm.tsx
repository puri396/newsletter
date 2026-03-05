"use client";

import { useRef, useState, type FormEvent } from "react";
import { getApiErrorMessage } from "@/lib/api/get-error-message";

type SubmitState = "idle" | "loading" | "success" | "already" | "error";

export function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
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
      className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4"
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
        <label htmlFor="subscribe-email" className="block text-sm font-medium text-zinc-300">
          Email <span className="text-red-400" aria-hidden>*</span>
        </label>
        <input
          id="subscribe-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          disabled={state === "loading"}
          autoComplete="email"
        />
      </div>
      <div>
        <label htmlFor="subscribe-name" className="block text-sm font-medium text-zinc-300">
          Name <span className="text-zinc-500 text-xs">(optional)</span>
        </label>
        <input
          id="subscribe-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          disabled={state === "loading"}
          autoComplete="name"
        />
      </div>
      <button
        type="submit"
        disabled={state === "loading"}
        className="w-full rounded-md bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
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
