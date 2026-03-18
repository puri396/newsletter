"use client";

import { useState, type FormEvent, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) {
      setError("Invalid reset link.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      } else {
        setError(data.error ?? "Failed to reset password.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <p className="mb-4 text-sm text-red-400">
          Invalid or missing reset token. Please request a new reset link.
        </p>
        <Link href="/forgot-password" className="text-sm text-cyan-400 hover:text-cyan-300">
          Request new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-3xl">
            ✅
          </div>
        </div>
        <h1 className="mb-2 text-xl font-semibold text-zinc-50">Password updated!</h1>
        <p className="mb-4 text-sm text-zinc-400">
          Your password has been reset. Redirecting to sign in…
        </p>
        <Link href="/login" className="text-sm text-cyan-400 hover:text-cyan-300">
          Go to sign in now
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-1 text-xl font-semibold text-zinc-50">Create new password</h1>
      <p className="mb-6 text-sm text-zinc-400">Choose a strong password of at least 8 characters.</p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-800/60 bg-red-950/40 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-zinc-300">
            New password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
            minLength={8}
            placeholder="••••••••"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-50 outline-none placeholder:text-zinc-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>
        <div>
          <label htmlFor="confirm" className="mb-1 block text-sm font-medium text-zinc-300">
            Confirm password
          </label>
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
            placeholder="••••••••"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-50 outline-none placeholder:text-zinc-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !password || !confirm}
          className="w-full rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 py-2.5 text-sm font-semibold text-white shadow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Reset password"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-950 via-slate-950 to-cyan-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-emerald-300 to-cyan-400 text-xl font-bold text-slate-900 shadow-lg">
            GC
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 px-8 py-8 shadow-2xl backdrop-blur-sm">
          <Suspense fallback={<p className="text-sm text-zinc-400">Loading…</p>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
