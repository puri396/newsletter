"use client";

import { useState } from "react";
import Link from "next/link";
import { getApiErrorMessage } from "@/lib/api/get-error-message";

interface EpicWhatsAppBroadcastProps {
  newsletterId: string;
  whatsappReach: number;
}

export function EpicWhatsAppBroadcast({
  newsletterId,
  whatsappReach,
}: EpicWhatsAppBroadcastProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleBroadcast() {
    if (loading) return;
    const ok = typeof window !== "undefined" && window.confirm(
      "Send this newsletter link to all WhatsApp-opted-in subscribers?",
    );
    if (!ok) return;
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/newsletters/${newsletterId}/whatsapp-broadcast`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({
          type: "error",
          text: getApiErrorMessage(data, "WhatsApp broadcast failed."),
        });
        return;
      }
      const sent = data.sent ?? 0;
      const failed = data.failed ?? 0;
      setMessage({
        type: "success",
        text: `Sent to ${sent} subscriber(s) on WhatsApp.${failed > 0 ? ` ${failed} failed.` : ""}`,
      });
    } catch {
      setMessage({ type: "error", text: "Request failed." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 text-xs text-zinc-300">
      <p className="mb-2 font-medium text-zinc-200">WhatsApp</p>
      <p className="mb-2 text-[11px] text-zinc-500">
        {whatsappReach === 0 ? (
          <>
            No WhatsApp-opted-in subscribers yet. Ask subscribers to share their
            phone and opt in on the{" "}
            <Link href="/subscribers" className="underline underline-offset-2 hover:text-zinc-200">
              Subscribers
            </Link>{" "}
            page.
          </>
        ) : (
          <>{whatsappReach} opted-in subscriber{whatsappReach === 1 ? "" : "s"}.</>
        )}
      </p>
      <button
        type="button"
        onClick={handleBroadcast}
        disabled={loading || whatsappReach === 0}
        className="rounded-md bg-emerald-700/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 disabled:opacity-50 disabled:pointer-events-none"
      >
        {loading ? "Sending…" : "Broadcast on WhatsApp"}
      </button>
      {message && (
        <p
          className={`mt-2 text-[11px] ${message.type === "success" ? "text-emerald-400" : "text-amber-400"}`}
          role="alert"
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
