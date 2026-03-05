"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui";

interface SubscriberUnsubscribeButtonProps {
  subscriberId: string;
  status: string;
}

export function SubscriberUnsubscribeButton({
  subscriberId,
  status,
}: SubscriberUnsubscribeButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (status !== "active") return <span className="text-zinc-500">—</span>;

  async function handleConfirm() {
    setLoading(true);
    try {
      const res = await fetch(`/api/subscribers/${subscriberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "unsubscribed" }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-amber-400 hover:text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-950 rounded px-2 py-1 min-h-[32px]"
        aria-label="Unsubscribe this subscriber"
      >
        Unsubscribe
      </button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Unsubscribe subscriber?"
        description="Are you sure you want to unsubscribe this subscriber? They will no longer receive newsletters."
        confirmLabel="Unsubscribe"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirm}
        loading={loading}
      />
    </>
  );
}
