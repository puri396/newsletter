"use client";

import { useEffect, useState, type FormEvent } from "react";

interface BrandSettings {
  brandName: string;
  brandLogoUrl: string | null;
  replyToEmail: string | null;
  brandColor: string | null;
}

export function BrandSettingsForm() {
  const [settings, setSettings] = useState<BrandSettings>({
    brandName: "",
    brandLogoUrl: null,
    replyToEmail: null,
    brandColor: null,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings/brand")
      .then((r) => r.json())
      .then((data: BrandSettings) => {
        setSettings({
          brandName: data.brandName ?? "",
          brandLogoUrl: data.brandLogoUrl ?? null,
          replyToEmail: data.replyToEmail ?? null,
          brandColor: data.brandColor ?? null,
        });
      })
      .catch(() => {
        /* ignore */
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/settings/brand", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to save.");
      }
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-50 outline-none placeholder:text-zinc-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50";

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded-lg bg-zinc-800" />
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {saved && (
        <div className="rounded-lg border border-emerald-800/50 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-300">
          Brand settings saved.
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-800/50 bg-red-950/40 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-300">
          Brand name
        </label>
        <input
          type="text"
          value={settings.brandName}
          onChange={(e) =>
            setSettings((s) => ({ ...s, brandName: e.target.value }))
          }
          placeholder="GenContent AI"
          maxLength={80}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-zinc-500">
          Shown in email headers and previews when no logo is set.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-300">
          Brand logo URL
        </label>
        <input
          type="url"
          value={settings.brandLogoUrl ?? ""}
          onChange={(e) =>
            setSettings((s) => ({
              ...s,
              brandLogoUrl: e.target.value || null,
            }))
          }
          placeholder="https://yourdomain.com/logo.png"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-zinc-500">
          Public URL to your logo image. Used as the default in all email
          newsletters. Individual newsletters can override this.
        </p>
        {settings.brandLogoUrl && (
          <div className="mt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={settings.brandLogoUrl}
              alt="Logo preview"
              className="h-10 rounded border border-zinc-700 object-contain bg-zinc-800 p-1"
            />
          </div>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-300">
          Reply-to email
        </label>
        <input
          type="email"
          value={settings.replyToEmail ?? ""}
          onChange={(e) =>
            setSettings((s) => ({
              ...s,
              replyToEmail: e.target.value || null,
            }))
          }
          placeholder="hello@yourdomain.com"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-zinc-500">
          When subscribers reply to newsletters, replies go here.
          Defaults to the FROM_EMAIL address.
        </p>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save brand settings"}
      </button>
    </form>
  );
}
