import Link from "next/link";
import { prisma } from "@/lib/db";
import { DashboardCard, EmptyState, StatusBadge } from "@/components/ui";

export const revalidate = 60;

export default async function DashboardPage() {
  let draftCount = 0;
  let scheduledCount = 0;
  let publishedCount = 0;
  let subscriberCount = 0;
  let upcoming: Awaited<
    ReturnType<typeof prisma.schedule.findMany<{
      where: { status: "pending" };
      orderBy: { sendAt: "asc" };
      take: 8;
      include: { newsletter: { select: { id: string; subject: string } } };
    }>>
  > = [];
  let dbError = false;

  try {
    const [draft, scheduled, published, subscribers, schedules] =
      await Promise.all([
        prisma.newsletter.count({ where: { status: "draft" } }),
        prisma.newsletter.count({ where: { status: "scheduled" } }),
        prisma.newsletter.count({ where: { status: "published" } }),
        prisma.subscriber.count(),
        prisma.schedule.findMany({
          where: { status: "pending" },
          orderBy: { sendAt: "asc" },
          take: 8,
          include: { newsletter: { select: { id: true, subject: true } } },
        }),
      ]);
    draftCount = draft;
    scheduledCount = scheduled;
    publishedCount = published;
    subscriberCount = subscribers;
    upcoming = schedules;
  } catch {
    dbError = true;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-50">Dashboard</h1>
        <p className="text-sm text-zinc-400">
          Overview of newsletters and scheduled sends.
        </p>
      </div>

      {dbError ? (
        <div
          className="rounded-lg border border-amber-800/60 bg-amber-950/40 px-4 py-3 text-sm text-amber-200"
          role="alert"
        >
          Unable to load dashboard. Please try again.
        </div>
      ) : (
        <>
          <section aria-labelledby="dashboard-summary">
            <h2 id="dashboard-summary" className="sr-only">
              Summary
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <DashboardCard title="Draft Newsletters" value={draftCount} />
              <DashboardCard title="Scheduled Newsletters" value={scheduledCount} />
              <DashboardCard title="Published Newsletters" value={publishedCount} />
              <DashboardCard title="Total Subscribers" value={subscriberCount} />
            </div>
          </section>

          <section aria-labelledby="quick-actions">
            <h2 id="quick-actions" className="mb-2 text-base font-semibold text-zinc-50">
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/newsletters"
                className="inline-flex items-center rounded-lg bg-zinc-700 px-3 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950 min-h-[44px]"
              >
                Create New Newsletter
              </Link>
              <Link
                href="/newsletters"
                className="inline-flex items-center rounded-lg border border-zinc-600 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950 min-h-[44px]"
              >
                View All Newsletters
              </Link>
              <Link
                href="/subscribers"
                className="inline-flex items-center rounded-lg border border-zinc-600 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950 min-h-[44px]"
              >
                View Subscribers
              </Link>
              <Link
                href="/analytics"
                className="inline-flex items-center rounded-lg border border-zinc-600 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950 min-h-[44px]"
              >
                View Analytics
              </Link>
              <Link
                href="/subscribe"
                className="inline-flex items-center rounded-lg border border-zinc-600 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950 min-h-[44px]"
              >
                Subscribe page
              </Link>
            </div>
          </section>

          <section aria-labelledby="upcoming-sends">
            <h2 id="upcoming-sends" className="mb-2 text-base font-semibold text-zinc-50">
              Upcoming Scheduled Sends
            </h2>
            {upcoming.length === 0 ? (
              <EmptyState
                title="No upcoming sends"
                description="Schedule a newsletter from its detail page to see it here."
                action={{ label: "View Newsletters", href: "/newsletters" }}
              />
            ) : (
              <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950/40">
                <table className="min-w-full divide-y divide-zinc-800 text-sm">
                  <thead className="bg-zinc-900/60">
                    <tr>
                      <th scope="col" className="px-4 py-2 text-left font-medium text-zinc-400">
                        Newsletter
                      </th>
                      <th scope="col" className="px-4 py-2 text-left font-medium text-zinc-400">
                        Send at
                      </th>
                      <th scope="col" className="px-4 py-2 text-left font-medium text-zinc-400">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {upcoming.map((s) => (
                      <tr key={s.id} className="hover:bg-zinc-900/40">
                        <td className="px-4 py-3">
                          <Link
                            href={`/newsletters/${s.newsletter.id}`}
                            className="font-medium text-zinc-100 hover:underline"
                          >
                            {s.newsletter.subject}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-zinc-400">
                          {new Date(s.sendAt).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status="pending" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
