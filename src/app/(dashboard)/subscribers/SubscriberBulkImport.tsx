"use client";

import { useState } from "react";
import { getApiErrorMessage } from "@/lib/api/get-error-message";

interface BulkResult {
  added: number;
  skipped: number;
  invalid: number;
}

export function SubscriberBulkImport() {
  const [emails, setEmails] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BulkResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!emails.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/subscribers/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: emails.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(getApiErrorMessage(data, "Import failed."));
        return;
      }
      setResult({ added: data.added, skipped: data.skipped, invalid: data.invalid });
      setEmails("");
    } catch {
      setError("Request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4">
      <h3 className="mb-2 text-sm font-medium text-zinc-300">Bulk import</h3>
      <p className="mb-3 text-xs text-zinc-500">
        Paste emails (comma or newline separated). Duplicates and invalid entries are skipped.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          name="emails"
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          placeholder="email1@example.com, email2@example.com"
          rows={4}
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
          disabled={loading}
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={loading || !emails.trim()}
            className="rounded bg-zinc-700 px-3 py-1.5 text-sm font-medium text-zinc-100 hover:bg-zinc-600 disabled:opacity-50"
          >
            {loading ? "Importing…" : "Import"}
          </button>
          {result && (
            <span className="text-sm text-zinc-400">
              Added: {result.added}, Skipped: {result.skipped}, Invalid: {result.invalid}
            </span>
          )}
        </div>
      </form>
      {error && (
        <p className="mt-2 text-sm text-amber-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
