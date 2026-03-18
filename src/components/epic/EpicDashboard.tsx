"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardCard } from "@/components/ui";
import { EpicContentTable } from "./EpicContentTable";
import { CreateContentModal } from "./CreateContentModal";

export type ContentTab = "all" | "newsletter" | "blog" | "image" | "video";
type StatusFilter = "all" | "draft" | "scheduled" | "published" | "archived";

export interface EpicContentItem {
  id: string;
  title: string;
  authorName: string | null;
  date: string;
  status: string;
  description: string;
  contentType: string;
  slug?: string | null;
  bannerImageUrl?: string | null;
}

interface EpicDashboardProps {
  title?: string;
  description?: string;
  totalCount: number;
  publishedCount: number;
  content: EpicContentItem[];
  page?: number;
  totalPages?: number;
  pageSize?: number;
}

const TABS: { id: ContentTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "newsletter", label: "Newsletter" },
  { id: "blog", label: "Blog" },
  { id: "image", label: "Image" },
  { id: "video", label: "Video" },
];

function filterByTab(items: EpicContentItem[], tab: ContentTab): EpicContentItem[] {
  if (tab === "all") return items;
  return items.filter((i) => i.contentType === tab);
}

export function EpicDashboard({
  title = "EPIC",
  description,
  totalCount,
  publishedCount,
  content,
  page = 1,
  totalPages = 1,
  pageSize,
}: EpicDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ContentTab>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const filteredContent = useMemo(() => {
    let items = filterByTab(content, activeTab);
    if (statusFilter !== "all") {
      items = items.filter(
        (item) => item.status.toLowerCase() === statusFilter,
      );
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q),
      );
    }
    return items;
  }, [content, activeTab, statusFilter, query]);

  const hasActiveFilter = statusFilter !== "all" || query.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h1 className="text-lg font-semibold text-zinc-50">{title}</h1>
          {description ? (
            <p className="text-sm text-zinc-400">{description}</p>
          ) : null}
        </div>
        {/* <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="shrink-0 rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
        >
          Create
        </button> */}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard title="Total Content Created" value={totalCount} />
        <DashboardCard title="Published Content" value={publishedCount} />
        <DashboardCard title="Visible in list" value={filteredContent.length} />
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex gap-1 rounded-lg border border-zinc-800 bg-zinc-950/60 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-zinc-100 bg-zinc-800 text-zinc-50"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center md:justify-end">
          <div className="flex items-center gap-2">
            <label
              htmlFor="epic-status-filter"
              className="text-xs text-zinc-400"
            >
              Status
            </label>
            <select
              id="epic-status-filter"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as StatusFilter)
              }
              className="h-8 rounded-md border border-zinc-800 bg-zinc-950 px-2 text-xs text-zinc-100 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            >
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="search"
              placeholder="Search by title or description…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-8 w-full rounded-md border border-zinc-800 bg-zinc-950 px-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 md:w-64"
            />
          </div>
        </div>
      </div>

      {hasActiveFilter && (
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <p>
            Showing <span className="font-medium text-zinc-100">{filteredContent.length}</span>{" "}
            result{filteredContent.length === 1 ? "" : "s"}
          </p>
          <button
            type="button"
            className="text-xs text-zinc-400 underline-offset-2 hover:text-zinc-200 hover:underline"
            onClick={() => {
              setQuery("");
              setStatusFilter("all");
            }}
          >
            Clear filters
          </button>
        </div>
      )}

      <EpicContentTable
        content={filteredContent}
        onRefresh={() => router.refresh()}
        onOpenCreate={() => setModalOpen(true)}
      />

      {totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-zinc-800 pt-3 text-xs text-zinc-400 sm:flex-row">
          <p>
            Page{" "}
            <span className="font-medium text-zinc-100">
              {page}
            </span>{" "}
            of{" "}
            <span className="font-medium text-zinc-100">
              {totalPages}
            </span>
            {pageSize ? (
              <>
                {" "}
                · Showing up to{" "}
                <span className="font-medium text-zinc-100">
                  {pageSize}
                </span>{" "}
                items per page
              </>
            ) : null}
          </p>
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => router.push(`/epic?page=${page - 1}`)}
              className="rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNumber = idx + 1;
              const isActive = pageNumber === page;
              return (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => router.push(`/epic?page=${pageNumber}`)}
                  className={`min-w-[2rem] rounded-md px-2 py-1 text-xs ${
                    isActive
                      ? "bg-zinc-100 text-zinc-900"
                      : "text-zinc-300 hover:bg-zinc-800"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => router.push(`/epic?page=${page + 1}`)}
              className="rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <CreateContentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => {
          setModalOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}
