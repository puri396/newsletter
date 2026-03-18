"use client";

import Link from "next/link";
import { StatusBadge, EmptyState, ContentTypeBadge } from "@/components/ui";
import { EpicActionsMenu } from "./EpicActionsMenu";
import type { EpicContentItem } from "./EpicDashboard";

interface EpicContentTableProps {
  content: EpicContentItem[];
  onRefresh: () => void;
  onOpenCreate?: () => void;
}

export function EpicContentTable({
  content,
  onRefresh,
  onOpenCreate,
}: EpicContentTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950/40">
      <table className="min-w-full divide-y divide-zinc-800 text-sm">
        <thead className="bg-zinc-900/60">
          <tr>
            <th
              scope="col"
              className="px-4 py-2 text-left font-medium text-zinc-400"
            >
              Title
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left font-medium text-zinc-400"
            >
              Type
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left font-medium text-zinc-400"
            >
              Date
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left font-medium text-zinc-400"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left font-medium text-zinc-400"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {content.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-0">
                <EmptyState
                  title="No content yet"
                  description="Create your first content to get started."
                  action={
                    onOpenCreate
                      ? { label: "Create content", onClick: onOpenCreate }
                      : undefined
                  }
                />
              </td>
            </tr>
          ) : (
            content.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-900/40">
                <td className="px-4 py-3">
                  <Link
                    href={`/epic/view/${item.id}`}
                    className="font-medium text-zinc-100 hover:underline"
                  >
                    {item.title}
                  </Link>
                  {item.description ? (
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-400">
                      {item.description}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <ContentTypeBadge type={item.contentType || "newsletter"} />
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {new Date(item.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    status={
                      item.status as
                        | "draft"
                        | "scheduled"
                        | "published"
                        | "archived"
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  <EpicActionsMenu item={item} onRefresh={onRefresh} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
