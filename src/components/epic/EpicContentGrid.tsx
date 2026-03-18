"use client";

import Link from "next/link";
import { StatusBadge, ContentTypeBadge, EmptyState } from "@/components/ui";
import type { EpicContentItem } from "./EpicDashboard";
import { EpicActionsMenu } from "./EpicActionsMenu";
import { ContentRenderer } from "@/components/content/ContentRenderer";

interface EpicContentGridProps {
  content: EpicContentItem[];
  onRefresh: () => void;
  onOpenCreate?: () => void;
}

export function EpicContentGrid({
  content,
  onRefresh,
  onOpenCreate,
}: EpicContentGridProps) {
  if (content.length === 0) {
    return (
      <EmptyState
        title="No content yet"
        description="Create your first content to get started."
        action={
          onOpenCreate
            ? { label: "Create content", onClick: onOpenCreate }
            : undefined
        }
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {content.map((item) => (
        <article
          key={item.id}
          className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60"
        >
          <Link href={`/epic/view/${item.id}`} className="block border-b border-zinc-800 bg-zinc-950">
            <ContentRenderer
              contentType={item.contentType as any}
              title={item.title}
              description={item.description}
              body={""}
              tags={[]}
              bannerImageUrl={item.bannerImageUrl ?? undefined}
              logoUrl={null}
              templateStyle={null}
              mode="thumbnail"
            />
          </Link>
          <div className="flex flex-1 flex-col justify-between p-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <Link
                  href={`/epic/view/${item.id}`}
                  className="line-clamp-2 text-sm font-medium text-zinc-50 hover:underline"
                >
                  {item.title}
                </Link>
              </div>
              <p className="line-clamp-2 text-xs text-zinc-400">
                {item.description}
              </p>

              {/* Primary quick actions row */}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                <Link
                  href={`/epic/view/${item.id}`}
                  className="inline-flex items-center rounded-md border border-zinc-700 px-2 py-1 text-[11px] font-medium text-zinc-200 hover:bg-zinc-800"
                >
                  Preview
                </Link>
                <Link
                  href={`/epic/edit/${item.id}`}
                  className="inline-flex items-center rounded-md border border-zinc-700 px-2 py-1 text-[11px] font-medium text-zinc-200 hover:bg-zinc-800"
                >
                  Edit
                </Link>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-zinc-500">
              <div className="flex flex-wrap items-center gap-1.5">
                <StatusBadge
                  status={
                    item.status as
                      | "draft"
                      | "scheduled"
                      | "published"
                      | "archived"
                  }
                />
                <ContentTypeBadge
                  type={item.contentType || "newsletter"}
                />
              </div>
              {/* Full actions menu (3-dots) preserved */}
              <EpicActionsMenu item={item} onRefresh={onRefresh} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

