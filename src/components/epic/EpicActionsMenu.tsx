"use client";

import { useState } from "react";
import { DropdownMenu, ConfirmDialog, useToast } from "@/components/ui";
import type { EpicContentItem } from "./EpicDashboard";
import { EditEpicModal } from "./EditEpicModal";
import { ShareModal } from "@/components/social/ShareModal";

interface EpicActionsMenuProps {
  item: EpicContentItem;
  onRefresh: () => void;
}

const THREE_DOTS_ICON = (
  <svg
    className="h-5 w-5"
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden
  >
    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
  </svg>
);

const APP_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL ?? "";

export function EpicActionsMenu({ item, onRefresh }: EpicActionsMenuProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const { addToast } = useToast();

  const updateStatus = async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/epic/content/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        addToast(`Status updated to ${status}.`, "success");
        onRefresh();
      } else {
        addToast("Failed to update status. Please try again.", "error");
      }
    } catch {
      addToast("Network error while updating status.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/epic/content/${item.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        addToast("Content deleted.", "success");
        onRefresh();
      } else {
        addToast("Failed to delete content. Please try again.", "error");
      }
    } catch {
      addToast("Network error while deleting content.", "error");
    } finally {
      setLoading(false);
    }
  };

  const publicUrl =
    item.contentType === "blog" && item.status === "published" && item.slug
      ? `${APP_URL}/blog/${item.slug}`
      : undefined;

  const items = [
    { label: "View", href: `/epic/view/${item.id}` },
    { label: "Edit", href: `/epic/edit/${item.id}` },
    { label: "Share", onClick: () => setShareOpen(true) },
    { label: "Delete", onClick: () => setDeleteOpen(true), variant: "danger" as const },
    { label: "Draft", onClick: () => updateStatus("draft") },
    { label: "Schedule", onClick: () => updateStatus("scheduled") },
    {
      label: "Publish",
      onClick: async () => {
        if (loading) return;

        // If this content is not an emailable type, just update the status.
        if (item.contentType !== "newsletter" && item.contentType !== "blog") {
          await updateStatus("published");
          return;
        }

        // Avoid obvious double-publish at the UI level.
        if (item.status === "published") {
          addToast("Already published – no emails were sent.", "info");
          return;
        }

        setLoading(true);
        try {
          const res = await fetch(`/api/newsletters/${item.id}/publish-now`, {
            method: "POST",
          });
          const data = await res.json().catch(() => ({}));

          if (!res.ok) {
            addToast(
              // Reuse the same helper used elsewhere, if available.
              (data && typeof data.error === "string" && data.error) ||
                "Failed to publish newsletter.",
              "error",
            );
            return;
          }

          if (data.message === "Already published.") {
            addToast("Already published – no emails were sent.", "info");
          } else {
            const sent = data.sent ?? 0;
            const failed = data.failed ?? 0;
            const waSent = data.whatsappSent ?? 0;
            const waFailed = data.whatsappFailed ?? 0;

            let text = `Published: sent to ${sent} subscriber(s).`;
            if (failed > 0) text += ` ${failed} failed.`;
            if (waSent > 0 || waFailed > 0) {
              text += ` WhatsApp: ${waSent} sent`;
              if (waFailed > 0) text += `, ${waFailed} failed`;
              text += ".";
            }

            addToast(text, "success");
          }

          onRefresh();
        } catch {
          addToast("Network error while publishing newsletter.", "error");
        } finally {
          setLoading(false);
        }
      },
    },
  ];

  return (
    <>
      <DropdownMenu trigger={THREE_DOTS_ICON} items={items} align="right" />
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete content"
        description="Are you sure you want to delete this content? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        loading={loading}
      />
      <EditEpicModal
        epicId={item.id}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title={item.title}
        description={item.description}
        url={publicUrl}
        imageUrl={item.bannerImageUrl ?? undefined}
      />
    </>
  );
}
