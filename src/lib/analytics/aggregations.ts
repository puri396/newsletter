import { prisma } from "@/lib/db";
import type {
  NewsletterMetrics,
  BestPerformingItem,
  OpenRateBySegmentRow,
  ClickRateByTopicRow,
  PerformanceByDayRow,
  OpenRateTrendRow,
  SubscriberGrowthTrendRow,
} from "./types";

interface RawRow {
  newsletterId: string;
  title: string;
  sent: number;
  delivered: number;
  opens: number;
  clicks: number;
}

function toNewsletterMetrics(row: RawRow): NewsletterMetrics {
  const delivered = Number(row.delivered) || 0;
  const opens = Number(row.opens) || 0;
  const clicks = Number(row.clicks) || 0;
  const sent = Number(row.sent) || 0;
  return {
    newsletterId: row.newsletterId,
    title: row.title,
    sent,
    delivered,
    opens,
    clicks,
    openRate: delivered > 0 ? opens / delivered : 0,
    clickRate: delivered > 0 ? clicks / delivered : 0,
    ctr: opens > 0 ? clicks / opens : 0,
  };
}

const DEFAULT_ANALYTICS_LIMIT = 100;

export async function getNewsletterAnalytics(
  newsletterIds?: string[],
  maxResults: number = DEFAULT_ANALYTICS_LIMIT,
): Promise<NewsletterMetrics[]> {
  const limit = Math.max(1, Math.min(500, maxResults));
  const rows = await prisma.$queryRaw<RawRow[]>`
    SELECT
      n.id AS "newsletterId",
      n.subject AS title,
      COUNT(e.id)::int AS sent,
      COUNT(CASE WHEN e."deliveredAt" IS NOT NULL OR e.status IN ('delivered', 'opened', 'clicked') THEN 1 END)::int AS delivered,
      COUNT(CASE WHEN e.opened = true OR e.status IN ('opened', 'clicked') THEN 1 END)::int AS opens,
      COUNT(CASE WHEN e.clicked = true OR e.status = 'clicked' THEN 1 END)::int AS clicks
    FROM "Newsletter" n
    INNER JOIN "EmailLog" e ON e."newsletterId" = n.id
    GROUP BY n.id, n.subject, n."createdAt"
    ORDER BY n."createdAt" DESC
    LIMIT ${limit}
  `;

  let result = rows.map(toNewsletterMetrics);
  if (newsletterIds && newsletterIds.length > 0) {
    const idSet = new Set(newsletterIds);
    result = result.filter((m) => idSet.has(m.newsletterId));
  }
  return result;
}

export async function getBestPerformingNewsletters(
  limit: number,
): Promise<BestPerformingItem[]> {
  const metrics = await getNewsletterAnalytics();
  const sorted = [...metrics].sort((a, b) => {
    const aScore = Math.max(a.openRate, a.clickRate);
    const bScore = Math.max(b.openRate, b.clickRate);
    return bScore - aScore;
  });
  return sorted.slice(0, limit).map((m) => ({
    newsletterId: m.newsletterId,
    title: m.title,
    openRate: m.openRate,
    clickRate: m.clickRate,
    sent: m.sent,
    opens: m.opens,
    clicks: m.clicks,
  }));
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** Open rate by segment (first newsletter tag or "uncategorized"). */
export async function getOpenRateBySegment(): Promise<OpenRateBySegmentRow[]> {
  const rows = await prisma.$queryRaw<
    { segment: string; sent: number; delivered: number; opens: number }[]
  >`
    SELECT
      COALESCE(n.tags[1], 'uncategorized') AS segment,
      COUNT(e.id)::int AS sent,
      COUNT(CASE WHEN e."deliveredAt" IS NOT NULL OR e.status IN ('delivered', 'opened', 'clicked') THEN 1 END)::int AS delivered,
      COUNT(CASE WHEN e.opened = true OR e.status IN ('opened', 'clicked') THEN 1 END)::int AS opens
    FROM "Newsletter" n
    INNER JOIN "EmailLog" e ON e."newsletterId" = n.id
    GROUP BY COALESCE(n.tags[1], 'uncategorized')
    ORDER BY opens DESC
  `;
  return rows.map((r) => ({
    segment: r.segment,
    sent: Number(r.sent),
    opens: Number(r.opens),
    openRate:
      Number(r.delivered) > 0 ? Number(r.opens) / Number(r.delivered) : 0,
  }));
}

/** Click rate by topic (first newsletter tag or "uncategorized"). */
export async function getClickRateByTopic(): Promise<ClickRateByTopicRow[]> {
  const rows = await prisma.$queryRaw<
    { topic: string; sent: number; delivered: number; clicks: number }[]
  >`
    SELECT
      COALESCE(n.tags[1], 'uncategorized') AS topic,
      COUNT(e.id)::int AS sent,
      COUNT(CASE WHEN e."deliveredAt" IS NOT NULL OR e.status IN ('delivered', 'opened', 'clicked') THEN 1 END)::int AS delivered,
      COUNT(CASE WHEN e.clicked = true OR e.status = 'clicked' THEN 1 END)::int AS clicks
    FROM "Newsletter" n
    INNER JOIN "EmailLog" e ON e."newsletterId" = n.id
    GROUP BY COALESCE(n.tags[1], 'uncategorized')
    ORDER BY clicks DESC
  `;
  return rows.map((r) => ({
    topic: r.topic,
    sent: Number(r.sent),
    clicks: Number(r.clicks),
    clickRate:
      Number(r.delivered) > 0 ? Number(r.clicks) / Number(r.delivered) : 0,
  }));
}

/** Performance by day of week (0 = Sunday … 6 = Saturday) from openedAt/clickedAt. */
export async function getPerformanceByDayOfWeek(): Promise<
  PerformanceByDayRow[]
> {
  const rows = await prisma.$queryRaw<
    { dayOfWeek: number; opens: number; clicks: number }[]
  >`
    SELECT
      EXTRACT(DOW FROM COALESCE(e."openedAt", e."createdAt"))::int AS "dayOfWeek",
      COUNT(CASE WHEN e.opened = true OR e.status IN ('opened', 'clicked') THEN 1 END)::int AS opens,
      COUNT(CASE WHEN e.clicked = true OR e.status = 'clicked' THEN 1 END)::int AS clicks
    FROM "EmailLog" e
    WHERE e."openedAt" IS NOT NULL OR e.opened = true
    GROUP BY EXTRACT(DOW FROM COALESCE(e."openedAt", e."createdAt"))
    ORDER BY "dayOfWeek"
  `;
  return rows.map((r) => ({
    dayOfWeek: Number(r.dayOfWeek),
    dayName: DAY_NAMES[Number(r.dayOfWeek)] ?? `Day ${r.dayOfWeek}`,
    opens: Number(r.opens),
    clicks: Number(r.clicks),
  }));
}

/** Open rate trend over time (last 30 days or 12 weeks). */
export async function getOpenRateTrend(
  bucket: "day" | "week",
): Promise<OpenRateTrendRow[]> {
  const limit = bucket === "day" ? 30 : 12;
  if (bucket === "day") {
    const rows = await prisma.$queryRaw<
      { period: string; opens: number; delivered: number }[]
    >`
      SELECT
        DATE(e."createdAt")::text AS period,
        COUNT(CASE WHEN e.opened = true OR e.status IN ('opened', 'clicked') THEN 1 END)::int AS opens,
        COUNT(CASE WHEN e."deliveredAt" IS NOT NULL OR e.status IN ('delivered', 'opened', 'clicked') THEN 1 END)::int AS delivered
      FROM "EmailLog" e
      WHERE e."createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(e."createdAt")
      ORDER BY period ASC
      LIMIT ${limit}
    `;
    return rows.map((r) => ({
      period: r.period,
      opens: Number(r.opens),
      delivered: Number(r.delivered),
      openRate:
        Number(r.delivered) > 0 ? Number(r.opens) / Number(r.delivered) : 0,
    }));
  }
  const rows = await prisma.$queryRaw<
    { period: string; opens: number; delivered: number }[]
  >`
    SELECT
      DATE_TRUNC('week', e."createdAt")::date::text AS period,
      COUNT(CASE WHEN e.opened = true OR e.status IN ('opened', 'clicked') THEN 1 END)::int AS opens,
      COUNT(CASE WHEN e."deliveredAt" IS NOT NULL OR e.status IN ('delivered', 'opened', 'clicked') THEN 1 END)::int AS delivered
    FROM "EmailLog" e
    WHERE e."createdAt" >= NOW() - INTERVAL '84 days'
    GROUP BY DATE_TRUNC('week', e."createdAt")
    ORDER BY period ASC
    LIMIT ${limit}
  `;
  return rows.map((r) => ({
    period: r.period,
    opens: Number(r.opens),
    delivered: Number(r.delivered),
    openRate:
      Number(r.delivered) > 0 ? Number(r.opens) / Number(r.delivered) : 0,
  }));
}

/** Subscriber growth trend (last 30 days). */
export async function getSubscriberGrowthTrend(): Promise<
  SubscriberGrowthTrendRow[]
> {
  const rows = await prisma.$queryRaw<
    { date: string; count: number; cumulative: number }[]
  >`
    WITH daily AS (
      SELECT
        DATE(s."createdAt")::text AS date,
        COUNT(*)::int AS count
      FROM "Subscriber" s
      WHERE s."createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(s."createdAt")
      ORDER BY date ASC
    )
    SELECT
      date,
      count,
      SUM(count) OVER (ORDER BY date)::int AS cumulative
    FROM daily
  `;
  return rows.map((r) => ({
    date: r.date,
    count: Number(r.count),
    cumulative: Number(r.cumulative),
  }));
}
