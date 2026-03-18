"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui";
import { getApiErrorMessage } from "@/lib/api/get-error-message";

interface NewsletterActionsProps {
  newsletterId: string;
  status: string;
  pendingSchedule: { id: string; sendAt: Date } | null;
  whatsappConfigured?: boolean;
  whatsappReach?: number;
}

export function NewsletterActions({
  newsletterId,
  status,
  pendingSchedule,
  whatsappConfigured = false,
  whatsappReach = 0,
}: NewsletterActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"publish" | "schedule" | "whatsapp" | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleValue, setScheduleValue] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [cancelScheduleDialogOpen, setCancelScheduleDialogOpen] = useState(false);
  const [cancelScheduleLoading, setCancelScheduleLoading] = useState(false);

  const canPublish = status === "draft" || status === "scheduled";
  const canSchedule = !pendingSchedule && (status === "draft" || status === "scheduled");

  async function handlePublishNow() {
    if (!canPublish || loading) return;
    setLoading("publish");
    setMessage(null);
    try {
      const res = await fetch(`/api/newsletters/${newsletterId}/publish-now`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: getApiErrorMessage(data, "Failed to publish.") });
        return;
      }
      const waSent = data.whatsappSent ?? 0;
      const waFailed = data.whatsappFailed ?? 0;
      setMessage({
        type: "success",
        text: `Sent to ${data.sent} subscriber(s).${data.failed ? ` ${data.failed} failed.` : ""}${
          whatsappConfigured && (waSent > 0 || waFailed > 0)
            ? ` WhatsApp: ${waSent} sent${waFailed > 0 ? `, ${waFailed} failed` : ""}.`
            : ""
        }`,
      });
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "Request failed." });
    } finally {
      setLoading(null);
    }
  }

  async function handleWhatsAppBroadcast() {
    if (loading || !whatsappConfigured || whatsappReach === 0) return;
    const ok = typeof window !== "undefined" && window.confirm(
      "Send this newsletter link to all WhatsApp-opted-in subscribers?",
    );
    if (!ok) return;
    setMessage(null);
    setLoading("whatsapp");
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
        text: `WhatsApp: sent to ${sent} subscriber(s).${failed > 0 ? ` ${failed} failed.` : ""}`,
      });
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "Request failed." });
    } finally {
      setLoading(null);
    }
  }

  async function handleScheduleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!scheduleValue.trim() || loading) return;
    const sendAt = new Date(scheduleValue);
    if (Number.isNaN(sendAt.getTime()) || sendAt <= new Date()) {
      setMessage({ type: "error", text: "Please choose a future date and time." });
      return;
    }
    setLoading("schedule");
    setMessage(null);
    try {
      const res = await fetch(`/api/newsletters/${newsletterId}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sendAt: sendAt.toISOString() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: getApiErrorMessage(data, "Failed to schedule.") });
        return;
      }
      setMessage({ type: "success", text: "Scheduled successfully." });
      setScheduleOpen(false);
      setScheduleValue("");
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "Request failed." });
    } finally {
      setLoading(null);
    }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/newsletters/${newsletterId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage({ type: "error", text: getApiErrorMessage(data, "Failed to delete.") });
        return;
      }
      setDeleteDialogOpen(false);
      router.push("/newsletters");
    } catch {
      setMessage({ type: "error", text: "Request failed." });
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleCancelSchedule() {
    if (!pendingSchedule) return;
    setCancelScheduleLoading(true);
    try {
      const res = await fetch(`/api/schedules/${pendingSchedule.id}`, {
        method: "PATCH",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage({ type: "error", text: getApiErrorMessage(data, "Failed to cancel schedule.") });
        setCancelScheduleDialogOpen(false);
        return;
      }
      setCancelScheduleDialogOpen(false);
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "Request failed." });
      setCancelScheduleDialogOpen(false);
    } finally {
      setCancelScheduleLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handlePublishNow}
          disabled={!canPublish || !!loading}
          className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50 disabled:pointer-events-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
        >
          {loading === "publish" ? "Sending…" : "Publish Now"}
        </button>
        {canSchedule ? (
          <button
            type="button"
            onClick={() => setScheduleOpen(true)}
            disabled={!!loading}
            className="rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-700 disabled:opacity-50 disabled:pointer-events-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
          >
            Schedule for Later
          </button>
        ) : pendingSchedule ? (
          <span className="text-sm text-zinc-400 flex items-center gap-2">
            Scheduled for{" "}
            {new Date(pendingSchedule.sendAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
            <button
              type="button"
              onClick={() => setCancelScheduleDialogOpen(true)}
              disabled={!!loading}
              className="rounded border border-amber-700/60 bg-amber-900/30 px-2 py-1 text-xs font-medium text-amber-300 hover:bg-amber-900/50 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
            >
              Cancel schedule
            </button>
          </span>
        ) : null}
        {whatsappConfigured ? (
          <button
            type="button"
            onClick={handleWhatsAppBroadcast}
            disabled={!!loading || whatsappReach === 0}
            className="rounded-lg border border-emerald-700/60 bg-emerald-950/40 px-3 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-900/40 disabled:opacity-50 disabled:pointer-events-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
          >
            {loading === "whatsapp" ? "Sending on WhatsApp…" : "Broadcast on WhatsApp"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setDeleteDialogOpen(true)}
          className="rounded-lg border border-red-800 bg-red-950/40 px-3 py-2 text-sm font-medium text-red-300 hover:bg-red-900/40 disabled:opacity-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
        >
          Delete
        </button>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Delete newsletter"
        description="Are you sure you want to delete this newsletter? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
      <ConfirmDialog
        open={cancelScheduleDialogOpen}
        onClose={() => setCancelScheduleDialogOpen(false)}
        title="Cancel scheduled send"
        description="Are you sure you want to cancel this scheduled send?"
        confirmLabel="Cancel schedule"
        variant="danger"
        onConfirm={handleCancelSchedule}
        loading={cancelScheduleLoading}
      />

      {scheduleOpen && (
        <form
          onSubmit={handleScheduleSubmit}
          className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 space-y-3"
        >
          <label className="block text-sm font-medium text-zinc-300">
            Send at (date and time)
          </label>
          <input
            type="datetime-local"
            value={scheduleValue}
            onChange={(e) => setScheduleValue(e.target.value)}
            min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)}
            className="w-full rounded border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-100"
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading === "schedule"}
              className="rounded bg-zinc-700 px-3 py-1.5 text-sm font-medium text-zinc-100 hover:bg-zinc-600 disabled:opacity-50"
            >
              {loading === "schedule" ? "Scheduling…" : "Schedule"}
            </button>
            <button
              type="button"
              onClick={() => { setScheduleOpen(false); setMessage(null); }}
              className="rounded border border-zinc-600 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {message && (
        <p
          className={`text-sm ${message.type === "success" ? "text-emerald-400" : "text-amber-400"}`}
          role="alert"
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
