"use client";

import { useRef, useState } from "react";
import { getApiErrorMessage } from "@/lib/api/get-error-message";

interface BulkResult {
  added: number;
  skipped: number;
  invalid: number;
}

type Tab = "paste" | "csv";

export function SubscriberBulkImport() {
  const [tab, setTab] = useState<Tab>("paste");
  const [emails, setEmails] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BulkResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handlePasteSubmit(e: React.FormEvent) {
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

  async function handleCsvSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!csvFile) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", csvFile);
      const res = await fetch("/api/subscribers/bulk", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(getApiErrorMessage(data, "Import failed."));
        return;
      }
      setResult({ added: data.added, skipped: data.skipped, invalid: data.invalid });
      setCsvFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      setError("Request failed.");
    } finally {
      setLoading(false);
    }
  }

  const tabClass = (active: boolean) =>
    `px-3 py-1.5 text-xs font-medium rounded-md transition ${
      active
        ? "bg-zinc-700 text-zinc-100"
        : "text-zinc-400 hover:text-zinc-200"
    }`;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4">
      <h3 className="mb-1 text-sm font-medium text-zinc-300">Bulk import</h3>
      <p className="mb-3 text-xs text-zinc-500">
        Import subscribers from a CSV file or by pasting emails.
      </p>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1 w-fit">
        <button type="button" className={tabClass(tab === "paste")} onClick={() => setTab("paste")}>
          Paste emails
        </button>
        <button type="button" className={tabClass(tab === "csv")} onClick={() => setTab("csv")}>
          Upload CSV
        </button>
      </div>

      {tab === "paste" && (
        <form onSubmit={handlePasteSubmit} className="space-y-3">
          <textarea
            name="emails"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            placeholder="email1@example.com, email2@example.com"
            rows={4}
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !emails.trim()}
            className="rounded bg-zinc-700 px-3 py-1.5 text-sm font-medium text-zinc-100 hover:bg-zinc-600 disabled:opacity-50"
          >
            {loading ? "Importing…" : "Import"}
          </button>
        </form>
      )}

      {tab === "csv" && (
        <form onSubmit={handleCsvSubmit} className="space-y-3">
          <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-900 p-4 text-center">
            <svg className="mx-auto mb-2 h-8 w-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mb-2 text-xs text-zinc-400">
              {csvFile ? (
                <span className="text-emerald-400">{csvFile.name}</span>
              ) : (
                "Choose a CSV file or drop it here"
              )}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
              className="hidden"
              id="csv-file-input"
            />
            <label
              htmlFor="csv-file-input"
              className="cursor-pointer rounded bg-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-100 hover:bg-zinc-600"
            >
              Browse file
            </label>
          </div>

          <div className="rounded-lg bg-zinc-800/60 px-3 py-2 text-xs text-zinc-400">
            <p className="font-medium text-zinc-300 mb-1">CSV format:</p>
            <p>Include a header row with columns: <code className="text-cyan-400">email</code>, <code className="text-cyan-400">name</code> (optional), <code className="text-cyan-400">phone</code> (optional).</p>
            <p className="mt-1 text-zinc-500">Example:</p>
            <pre className="mt-1 text-zinc-400">email,name,phone
alice@example.com,Alice,+15551234567
bob@example.com,Bob,</pre>
          </div>

          <button
            type="submit"
            disabled={loading || !csvFile}
            className="rounded bg-zinc-700 px-3 py-1.5 text-sm font-medium text-zinc-100 hover:bg-zinc-600 disabled:opacity-50"
          >
            {loading ? "Importing…" : "Import CSV"}
          </button>
        </form>
      )}

      {result && (
        <div className="mt-3 flex flex-wrap gap-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40 px-3 py-2 text-sm">
          <span className="text-emerald-400">✓ Added: {result.added}</span>
          <span className="text-zinc-400">Skipped: {result.skipped}</span>
          {result.invalid > 0 && (
            <span className="text-amber-400">Invalid: {result.invalid}</span>
          )}
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-amber-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
