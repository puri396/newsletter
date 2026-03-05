import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ContentRepurposingPanel } from "@/components/newsletter";
import { StatusBadge } from "@/components/ui";
import { NewsletterActions } from "./NewsletterActions";

interface NewsletterDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function NewsletterDetailPage({
  params,
}: NewsletterDetailPageProps) {
  const { id } = await params;

  let newsletter: Awaited<
    ReturnType<typeof prisma.newsletter.findUnique<{
      include: { schedules: true };
    }>>
  > = null;
  try {
    newsletter = await prisma.newsletter.findUnique({
      where: { id },
      include: {
        schedules: {
          where: { status: "pending" },
          orderBy: { sendAt: "asc" },
          take: 1,
        },
      },
    });
  } catch {
    notFound();
  }

  if (!newsletter) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <Link
          href="/newsletters"
          className="hover:text-zinc-100"
        >
          Newsletters
        </Link>
        <span aria-hidden>/</span>
        <span className="text-zinc-500 truncate max-w-[200px] lg:max-w-md" title={newsletter.subject}>
          {newsletter.subject}
        </span>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-3">
        <h1 className="text-lg font-semibold text-zinc-50">
          {newsletter.subject}
        </h1>
        {newsletter.description ? (
          <p className="text-sm text-zinc-400">{newsletter.description}</p>
        ) : null}
        <div className="text-xs text-zinc-500 flex items-center gap-2">
          <StatusBadge status={newsletter.status} />
          <span>{new Date(newsletter.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {newsletter.status === "draft" ? (
            <Link
              href={`/newsletters/${newsletter.id}/edit`}
              className="inline-flex items-center rounded-lg border border-zinc-600 px-3 py-1.5 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
            >
              Edit draft
            </Link>
          ) : null}
          <NewsletterActions
            newsletterId={newsletter.id}
            status={newsletter.status}
            pendingSchedule={newsletter.schedules[0] ?? null}
          />
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
          <p className="text-xs font-medium text-zinc-400 mb-2">Body</p>
          <div className="text-sm text-zinc-200 whitespace-pre-wrap">
            {newsletter.body || "—"}
          </div>
        </div>
      </div>

      <ContentRepurposingPanel
        newsletterBody={newsletter.body}
        newsletterSubject={newsletter.subject}
      />
    </div>
  );
}
