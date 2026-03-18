"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getApiErrorMessage } from "@/lib/api/get-error-message";

interface SubscriberWhatsAppOptInToggleProps {
  subscriberId: string;
  whatsappOptIn: boolean;
}

export function SubscriberWhatsAppOptInToggle({
  subscriberId,
  whatsappOptIn,
}: SubscriberWhatsAppOptInToggleProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/subscribers/${subscriberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsappOptIn: !whatsappOptIn }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(getApiErrorMessage(data, "Failed to update WhatsApp opt-in."));
        return;
      }
      router.refresh();
    } catch {
      setError("Request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className="text-xs text-zinc-400 hover:text-zinc-200 disabled:opacity-50"
      >
        {loading ? "…" : whatsappOptIn ? "Disable WhatsApp" : "Enable WhatsApp"}
      </button>
      {error ? (
        <p className="text-[11px] text-amber-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
