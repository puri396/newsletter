"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { OpenRateTrendRow, SubscriberGrowthTrendRow } from "@/lib/analytics/types";

interface AnalyticsChartsProps {
  openRateTrend: OpenRateTrendRow[];
  subscriberGrowthTrend: SubscriberGrowthTrendRow[];
}

function formatPct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function AnalyticsCharts({
  openRateTrend,
  subscriberGrowthTrend,
}: AnalyticsChartsProps) {
  const openRateData = openRateTrend.map((r) => ({
    period: r.period,
    openRate: r.openRate,
    opens: r.opens,
    delivered: r.delivered,
  }));
  const growthData = subscriberGrowthTrend.map((r) => ({
    date: r.date,
    newSubscribers: r.count,
    total: r.cumulative,
  }));

  return (
    <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
      <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4">
        <h4 className="text-sm font-medium text-zinc-300 mb-3">
          Open rate over time
        </h4>
        <div className="h-[240px] w-full">
          {openRateData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">
              No data for the selected period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={openRateData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="period"
                  tick={{ fontSize: 11, fill: "#a1a1aa" }}
                  tickFormatter={(v) => {
                    const d = String(v);
                    return d.length > 10 ? d.slice(0, 7) : d;
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#a1a1aa" }}
                  tickFormatter={(v) => formatPct(v)}
                  domain={[0, 1]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                    borderRadius: "6px",
                  }}
                  labelStyle={{ color: "#d4d4d8" }}
                  formatter={(value, name) => {
                    const num = typeof value === "number" ? value : 0;
                    return [
                      name === "openRate" ? formatPct(num) : num,
                      name === "openRate" ? "Open rate" : name === "opens" ? "Opens" : "Delivered",
                    ];
                  }}
                  labelFormatter={(label) => `Period: ${label}`}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px" }}
                  formatter={() => "Open rate"}
                />
                <Line
                  type="monotone"
                  dataKey="openRate"
                  stroke="#a78bfa"
                  strokeWidth={2}
                  dot={{ r: 2, fill: "#a78bfa" }}
                  name="Open rate"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4">
        <h4 className="text-sm font-medium text-zinc-300 mb-3">
          Subscriber growth (last 30 days)
        </h4>
        <div className="h-[240px] w-full">
          {growthData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">
              No subscriber data for the selected period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#a1a1aa" }}
                  tickFormatter={(v) => {
                    const d = String(v);
                    return d.length > 10 ? d.slice(5) : d;
                  }}
                />
                <YAxis tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                    borderRadius: "6px",
                  }}
                  labelStyle={{ color: "#d4d4d8" }}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Line
                  type="monotone"
                  dataKey="newSubscribers"
                  stroke="#34d399"
                  strokeWidth={2}
                  dot={{ r: 2, fill: "#34d399" }}
                  name="New"
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  dot={{ r: 2, fill: "#60a5fa" }}
                  name="Cumulative"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
