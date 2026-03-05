import { MetricCard } from "@/components/ui/MetricCard";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-50">
          Overview
        </h2>
        <p className="text-sm text-zinc-400">
          High-level status of your AI-powered newsletter activity.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Draft newsletters"
          value={12}
          description="Not yet scheduled. Refine and schedule when ready."
        />
        <MetricCard
          label="Scheduled sends"
          value={5}
          description="Queued for upcoming delivery windows."
        />
        <MetricCard
          label="Published newsletters"
          value={8}
          description="Recently sent newsletters across your audience."
        />
      </section>
    </div>
  );
}

