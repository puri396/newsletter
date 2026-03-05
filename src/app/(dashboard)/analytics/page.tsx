import Link from "next/link";
import {
  getNewsletterAnalytics,
  getBestPerformingNewsletters,
  getOpenRateBySegment,
  getClickRateByTopic,
  getPerformanceByDayOfWeek,
  getOpenRateTrend,
  getSubscriberGrowthTrend,
} from "@/lib/analytics";
import { EmptyState } from "@/components/ui";
import { AnalyticsCharts } from "./AnalyticsCharts";

interface AnalyticsPageProps {
  searchParams?: Promise<{ sort?: string; order?: string }>;
}

type SortKey = "title" | "sent" | "delivered" | "opens" | "openRate" | "clicks" | "clickRate" | "ctr";

function parseSort(sort?: string): SortKey {
  const allowed: SortKey[] = [
    "title",
    "sent",
    "delivered",
    "opens",
    "openRate",
    "clicks",
    "clickRate",
    "ctr",
  ];
  if (sort && allowed.includes(sort as SortKey)) return sort as SortKey;
  return "sent";
}

function formatPct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const params = await searchParams;
  const sortKey = parseSort(params?.sort);
  const order = params?.order === "asc" ? "asc" : "desc";

  let metrics: Awaited<ReturnType<typeof getNewsletterAnalytics>> = [];
  let best: Awaited<ReturnType<typeof getBestPerformingNewsletters>> = [];
  let segments: Awaited<ReturnType<typeof getOpenRateBySegment>> = [];
  let byTopic: Awaited<ReturnType<typeof getClickRateByTopic>> = [];
  let byDay: Awaited<ReturnType<typeof getPerformanceByDayOfWeek>> = [];
  let openRateTrend: Awaited<ReturnType<typeof getOpenRateTrend>> = [];
  let subscriberGrowth: Awaited<ReturnType<typeof getSubscriberGrowthTrend>> = [];
  let error = false;

  try {
    [metrics, best, segments, byTopic, byDay, openRateTrend, subscriberGrowth] =
      await Promise.all([
        getNewsletterAnalytics(),
        getBestPerformingNewsletters(3),
        getOpenRateBySegment(),
        getClickRateByTopic(),
        getPerformanceByDayOfWeek(),
        getOpenRateTrend("day"),
        getSubscriberGrowthTrend(),
      ]);
  } catch {
    error = true;
  }

  const sorted = [...metrics].sort((a, b) => {
    const aVal = a[sortKey] as number | string;
    const bVal = b[sortKey] as number | string;
    const cmp = typeof aVal === "string" ? aVal.localeCompare(bVal as string) : (aVal as number) - (bVal as number);
    return order === "asc" ? cmp : -cmp;
  });

  function sortLink(field: SortKey, label: string) {
    const nextOrder = sortKey === field && order === "desc" ? "asc" : "desc";
    return (
      <Link
        href={`/analytics?sort=${field}&order=${nextOrder}`}
        className="hover:text-zinc-200"
      >
        {label} {sortKey === field ? (order === "desc" ? "↓" : "↑") : ""}
      </Link>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-50">Analytics</h2>
        <p className="text-sm text-zinc-400">
          Newsletter delivery and engagement metrics.
        </p>
      </div>

      {error ? (
        <div
          className="rounded-lg border border-amber-800/60 bg-amber-950/40 px-4 py-3 text-sm text-amber-200"
          role="alert"
        >
          Unable to load analytics. Please try again.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950/40">
            <table className="min-w-full divide-y divide-zinc-800 text-sm">
              <thead className="bg-zinc-900/60">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left font-medium text-zinc-400">
                    {sortLink("title", "Newsletter")}
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-zinc-400">
                    {sortLink("sent", "Sent")}
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-zinc-400">
                    {sortLink("delivered", "Delivered")}
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-zinc-400">
                    {sortLink("opens", "Opens")}
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-zinc-400">
                    {sortLink("openRate", "Open Rate")}
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-zinc-400">
                    {sortLink("clicks", "Clicks")}
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-zinc-400">
                    {sortLink("clickRate", "Click Rate")}
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-zinc-400">
                    {sortLink("ctr", "CTR")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {sorted.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-0">
                      <EmptyState
                        title="No email data yet"
                        description="Send a newsletter to see delivery and engagement metrics here."
                        action={{ label: "Send a newsletter", href: "/newsletters" }}
                      />
                    </td>
                  </tr>
                ) : (
                  sorted.map((m) => (
                    <tr key={m.newsletterId} className="hover:bg-zinc-900/40">
                      <td className="px-4 py-3 text-zinc-100">
                        <Link
                          href={`/newsletters/${m.newsletterId}`}
                          className="hover:underline"
                        >
                          {m.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-300">
                        {m.sent}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-300">
                        {m.delivered}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-300">
                        {m.opens}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-400">
                        {formatPct(m.openRate)}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-300">
                        {m.clicks}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-400">
                        {formatPct(m.clickRate)}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-400">
                        {formatPct(m.ctr)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <section>
            <h3 className="text-base font-semibold text-zinc-50 mb-1">
              Segmentation
            </h3>
            <p className="text-sm text-zinc-400 mb-3">
              Open rate by segment (first tag), click rate by topic, and performance by day of week.
            </p>
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3 mb-4">
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4">
                <h4 className="text-xs font-medium text-zinc-500 mb-2">Open rate by segment</h4>
                {segments.length === 0 ? (
                  <p className="text-xs text-zinc-500">No data</p>
                ) : (
                  <ul className="space-y-1.5 text-sm">
                    {segments.slice(0, 5).map((s) => (
                      <li key={s.segment} className="flex justify-between text-zinc-300">
                        <span className="truncate mr-2">{s.segment}</span>
                        <span className="text-zinc-400 shrink-0">{formatPct(s.openRate)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4">
                <h4 className="text-xs font-medium text-zinc-500 mb-2">Click rate by topic</h4>
                {byTopic.length === 0 ? (
                  <p className="text-xs text-zinc-500">No data</p>
                ) : (
                  <ul className="space-y-1.5 text-sm">
                    {byTopic.slice(0, 5).map((t) => (
                      <li key={t.topic} className="flex justify-between text-zinc-300">
                        <span className="truncate mr-2">{t.topic}</span>
                        <span className="text-zinc-400 shrink-0">{formatPct(t.clickRate)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4">
                <h4 className="text-xs font-medium text-zinc-500 mb-2">By day of week</h4>
                {byDay.length === 0 ? (
                  <p className="text-xs text-zinc-500">No data</p>
                ) : (
                  <ul className="space-y-1.5 text-sm">
                    {byDay.map((d) => (
                      <li key={d.dayOfWeek} className="flex justify-between text-zinc-300">
                        <span className="mr-2">{d.dayName}</span>
                        <span className="text-zinc-400 shrink-0">
                          {d.opens} opens / {d.clicks} clicks
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-base font-semibold text-zinc-50 mb-1">
              Trends
            </h3>
            <p className="text-sm text-zinc-400 mb-3">
              Open rate over time and subscriber growth (last 30 days).
            </p>
            <AnalyticsCharts
              openRateTrend={openRateTrend}
              subscriberGrowthTrend={subscriberGrowth}
            />
          </section>

          <section>
            <h3 className="text-base font-semibold text-zinc-50 mb-1">
              Best Performing AI Content
            </h3>
            <p className="text-sm text-zinc-400 mb-3">
              Top 3 by open rate or click rate.
            </p>
            {best.length === 0 ? (
              <EmptyState
                title="No data yet"
                description="Send and deliver newsletters to see top performers here."
                action={{ label: "View Newsletters", href: "/newsletters" }}
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {best.map((item, i) => (
                  <div
                    key={item.newsletterId}
                    className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4"
                  >
                    <div className="text-xs font-medium text-zinc-500 mb-1">
                      #{i + 1}
                    </div>
                    <Link
                      href={`/newsletters/${item.newsletterId}`}
                      className="font-medium text-zinc-100 hover:underline block truncate"
                    >
                      {item.title}
                    </Link>
                    <dl className="mt-2 space-y-0.5 text-sm text-zinc-400">
                      <div className="flex justify-between">
                        <dt>Open rate</dt>
                        <dd>{formatPct(item.openRate)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Click rate</dt>
                        <dd>{formatPct(item.clickRate)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Sent</dt>
                        <dd>{item.sent}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Opens</dt>
                        <dd>{item.opens}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Clicks</dt>
                        <dd>{item.clicks}</dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
