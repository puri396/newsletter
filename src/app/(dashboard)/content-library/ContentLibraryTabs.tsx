"use client";

import { useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui";
import { EmptyState } from "@/components/ui";

type TabId = "newsletters" | "images" | "videos";

interface NewsletterItem {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  bannerImageUrl?: string | null;
}

interface ContentLibraryTabsProps {
  newsletters: NewsletterItem[];
}

export function ContentLibraryTabs({ newsletters }: ContentLibraryTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("newsletters");

  const tabs: { id: TabId; label: string }[] = [
    { id: "newsletters", label: "Newsletters" },
    { id: "images", label: "Images" },
    { id: "videos", label: "Videos" },
  ];

  return (
    <div className="space-y-6">
      <div className="inline-flex gap-1 rounded-lg border border-zinc-800 bg-zinc-950/60 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-zinc-800 text-zinc-50"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "newsletters" && (
        <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950/40">
          <table className="min-w-full divide-y divide-zinc-800 text-sm">
            <thead className="bg-zinc-900/60">
              <tr>
                <th className="w-16 px-2 py-2 text-left font-medium text-zinc-400">
                  Banner
                </th>
                <th className="px-4 py-2 text-left font-medium text-zinc-400">
                  Title
                </th>
                <th className="px-4 py-2 text-left font-medium text-zinc-400">
                  Status
                </th>
                <th className="px-4 py-2 text-left font-medium text-zinc-400">
                  Created
                </th>
                <th className="px-4 py-2 text-left font-medium text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {newsletters.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-0">
                    <EmptyState
                      title="No newsletters yet"
                      description="Create your first newsletter in EPIC to get started."
                      action={{ label: "Open Content Studio", href: "/epic" }}
                    />
                  </td>
                </tr>
              ) : (
                newsletters.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-900/40">
                    <td className="px-2 py-3 align-top">
                      {item.bannerImageUrl ? (
                        <img
                          src={item.bannerImageUrl}
                          alt=""
                          className="h-10 w-14 rounded object-cover"
                        />
                      ) : (
                        <span className="inline-block h-10 w-14 rounded bg-zinc-800/80" />
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-zinc-100">
                      <Link
                        href={`/epic/view/${item.id}`}
                        className="font-medium hover:underline"
                      >
                        {item.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <StatusBadge status={item.status as "draft" | "scheduled" | "published"} />
                    </td>
                    <td className="px-4 py-3 align-top text-zinc-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex gap-2">
                        <Link
                          href={`/epic/view/${item.id}`}
                          className="text-xs text-zinc-400 hover:text-zinc-100"
                        >
                          Edit
                        </Link>
                        <span className="text-zinc-600">|</span>
                        <Link
                          href={`/epic/view/${item.id}`}
                          className="text-xs text-zinc-400 hover:text-zinc-100"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "images" && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/40">
          <EmptyState
            title="No images yet"
            description="Image content coming soon."
          />
        </div>
      )}

      {activeTab === "videos" && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/40">
          <EmptyState
            title="No videos yet"
            description="Video content coming soon."
          />
        </div>
      )}
    </div>
  );
}
