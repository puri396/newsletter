"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json()) as { success?: boolean };
      if (data.success) {
        setSent(true);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-950 via-slate-950 to-cyan-950 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-emerald-300 to-cyan-400 text-xl font-bold text-slate-900 shadow-lg">
            GC
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 px-8 py-8 shadow-2xl backdrop-blur-sm">
          {sent ? (
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-3xl">
                  ✉️
                </div>
              </div>
              <h1 className="mb-2 text-xl font-semibold text-zinc-50">
                Check your inbox
              </h1>
              <p className="mb-6 text-sm text-zinc-400">
                If an account with <strong className="text-zinc-300">{email}</strong> exists,
                we sent a password reset link. It expires in 1 hour.
              </p>
              <Link
                href="/login"
                className="text-sm text-cyan-400 hover:text-cyan-300"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="mb-1 text-xl font-semibold text-zinc-50">
                Forgot password?
              </h1>
              <p className="mb-6 text-sm text-zinc-400">
                Enter your email and we&apos;ll send you a reset link.
              </p>

              {error && (
                <div className="mb-4 rounded-lg border border-red-800/60 bg-red-950/40 px-3 py-2 text-sm text-red-300">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1 block text-sm font-medium text-zinc-300"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-50 outline-none placeholder:text-zinc-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !email.trim()}
                  className="w-full rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 py-2.5 text-sm font-semibold text-white shadow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Sending…" : "Send reset link"}
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-zinc-500">
                Remember it?{" "}
                <Link href="/login" className="text-cyan-400 hover:text-cyan-300">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
