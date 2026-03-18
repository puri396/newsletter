import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { StatusBadge, ContentTypeBadge } from "@/components/ui";
import { ContentRepurposingPanel } from "@/components/newsletter";
import { isWhatsAppConfigured } from "@/lib/whatsapp";
import { getWhatsAppRecipientCount } from "@/lib/subscribers/whatsapp";
import { EpicWhatsAppBroadcast } from "@/components/epic/EpicWhatsAppBroadcast";
import { EpicSeoPanel, type SeoData } from "@/components/epic/EpicSeoPanel";
import { ContentRenderer } from "@/components/content/ContentRenderer";
import { SocialSharePanel } from "@/components/social/SocialSharePanel";

interface EpicViewPageProps {
  params: Promise<{ id: string }>;
}

function pct(num: number, den: number) {
  if (den === 0) return "—";
  return `${Math.round((num / den) * 100)}%`;
}

export default async function EpicViewPage({ params }: EpicViewPageProps) {
  const { id } = await params;

  let newsletter: Awaited<ReturnType<typeof prisma.newsletter.findUnique>> | null =
    null;
  let subscribers:
    | Awaited<ReturnType<typeof prisma.subscriber.findMany>>
    | null = null;
  let dbError = false;
  try {
    const [newsletterResult, subscribersResult] = await Promise.all([
      prisma.newsletter.findUnique({
        where: { id },
      }),
      prisma.subscriber.findMany({
        where: { status: "active" },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);
    newsletter = newsletterResult;
    subscribers = subscribersResult;
  } catch {
    dbError = true;
  }

  if (dbError) {
    return (
      <div className="space-y-4">
        <div
          className="rounded-lg border border-amber-800/60 bg-amber-950/40 px-4 py-3 text-sm text-amber-200"
          role="alert"
        >
          Unable to load this EPIC item from the database. Please try again.
        </div>
      </div>
    );
  }

  if (!newsletter) {
    notFound();
  }

  const isEmailableType =
    newsletter.contentType === "newsletter" || !newsletter.contentType;

  const [totalSends, openCount, clickCount, whatsappReach] = isEmailableType
    ? await Promise.all([
        prisma.emailLog.count({ where: { newsletterId: id } }),
        prisma.emailLog.count({ where: { newsletterId: id, opened: true } }),
        prisma.emailLog.count({ where: { newsletterId: id, clicked: true } }),
        getWhatsAppRecipientCount(),
      ])
    : [0, 0, 0, 0];

  const whatsappConfigured = isWhatsAppConfigured();

  const createdAt = newsletter.createdAt
    ? new Date(newsletter.createdAt)
    : null;

  const epicMetadata =
    (newsletter.epicMetadata as
      | {
          tone?: string;
          aiProvider?: string;
          referenceLinks?: string[];
          mediaReferenceLinks?: string[];
          keyPoints?: string[];
          imagePrompts?: string[];
          hashtags?: string[];
          thumbnailPrompt?: string;
          imageError?: string;
          seo?: SeoData;
          templateStyle?: string;
        }
      | null) ?? {};

  const referenceLinks = epicMetadata.referenceLinks ?? [];
  const mediaReferenceLinks = epicMetadata.mediaReferenceLinks ?? [];
  const keyPoints = epicMetadata.keyPoints ?? [];
  const hashtags = epicMetadata.hashtags ?? [];

  const showRepurposePanel =
    newsletter.contentType === "newsletter" ||
    newsletter.contentType === "blog" ||
    !newsletter.contentType;

  const APP_URL =
    process.env.APP_URL?.replace(/\/$/, "") ??
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "https://gencontent.ai";

  const publicUrl =
    newsletter.contentType === "blog" &&
    newsletter.status === "published" &&
    newsletter.slug
      ? `${APP_URL}/blog/${newsletter.slug}`
      : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <Link href="/epic" className="hover:text-zinc-100">
          EPIC
        </Link>
        <span aria-hidden>/</span>
        <span
          className="max-w-[260px] truncate text-zinc-500 lg:max-w-md"
          title={newsletter.shortTitle ?? newsletter.subject}
        >
          {newsletter.shortTitle ?? newsletter.subject}
        </span>
      </div>

      <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 lg:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-lg font-semibold text-zinc-50">
              {newsletter.subject}
            </h1>
            {newsletter.description ? (
              <p className="text-sm text-zinc-400">
                {newsletter.description}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              <StatusBadge status={newsletter.status} />
              <ContentTypeBadge
                type={newsletter.contentType || "newsletter"}
              />
              {createdAt ? (
                <span>
                  {createdAt.toLocaleDateString(undefined, {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })}{" "}
                  {createdAt.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {newsletter.contentType === "image" || newsletter.bannerImageUrl ? (
          newsletter.bannerImageUrl ? (
            <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={newsletter.bannerImageUrl}
                alt={newsletter.subject ?? "Generated image"}
                className=""
              />
            </div>
          ) : newsletter.contentType === "image" ? (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 text-center text-sm text-zinc-400">
              <p>Image could not be generated. Try regenerating this content.</p>
              {epicMetadata.imageError ? (
                <p className="mt-2 text-xs text-zinc-500 max-w-lg mx-auto break-words">
                  {epicMetadata.imageError}
                </p>
              ) : null}
            </div>
          ) : null
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
            <p className="text-xs font-medium text-zinc-400">Content</p>
            <ContentRenderer
              contentType={newsletter.contentType ?? "newsletter"}
              title={newsletter.subject}
              description={newsletter.description}
              body={newsletter.body}
              tags={newsletter.tags}
              bannerImageUrl={newsletter.bannerImageUrl}
              logoUrl={newsletter.logoUrl}
              templateStyle={epicMetadata.templateStyle as any}
              mode="full"
            />
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 text-xs text-zinc-300">
              <p className="mb-2 font-medium text-zinc-200">Metadata</p>
              <dl className="space-y-1.5">
                {epicMetadata.tone ? (
                  <div className="flex justify-between gap-2">
                    <dt className="text-zinc-500">Tone</dt>
                    <dd className="text-zinc-200">{epicMetadata.tone}</dd>
                  </div>
                ) : null}
                {epicMetadata.aiProvider ? (
                  <div className="flex justify-between gap-2">
                    <dt className="text-zinc-500">AI Provider</dt>
                    <dd className="text-zinc-200">
                      {epicMetadata.aiProvider}
                    </dd>
                  </div>
                ) : null}
                {newsletter.aiModel ? (
                  <div className="flex justify-between gap-2">
                    <dt className="text-zinc-500">AI Model</dt>
                    <dd className="text-zinc-200">{newsletter.aiModel}</dd>
                  </div>
                ) : null}
                {hashtags.length > 0 ? (
                  <div className="space-y-1">
                    <dt className="text-zinc-500">Hashtags</dt>
                    <dd className="flex flex-wrap gap-1">
                      {hashtags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-100"
                        >
                          #{tag}
                        </span>
                      ))}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>

            {isEmailableType && totalSends > 0 ? (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 text-xs text-zinc-300">
                <p className="mb-3 font-medium text-zinc-200">Email Analytics</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md bg-zinc-800/60 px-2 py-2">
                    <p className="text-base font-semibold text-zinc-100">{totalSends}</p>
                    <p className="mt-0.5 text-zinc-500">Sent</p>
                  </div>
                  <div className="rounded-md bg-zinc-800/60 px-2 py-2">
                    <p className="text-base font-semibold text-zinc-100">{pct(openCount, totalSends)}</p>
                    <p className="mt-0.5 text-zinc-500">Open rate</p>
                  </div>
                  <div className="rounded-md bg-zinc-800/60 px-2 py-2">
                    <p className="text-base font-semibold text-zinc-100">{pct(clickCount, totalSends)}</p>
                    <p className="mt-0.5 text-zinc-500">Click rate</p>
                  </div>
                </div>
              </div>
            ) : null}

            {isEmailableType && whatsappConfigured ? (
              <EpicWhatsAppBroadcast
                newsletterId={id}
                whatsappReach={whatsappReach}
              />
            ) : null}

            {isEmailableType && subscribers && (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 text-xs text-zinc-300">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="font-medium text-zinc-200">Subscribers</p>
                  <span className="text-[11px] text-zinc-500">
                    Showing {subscribers.length} active subscriber
                    {subscribers.length === 1 ? "" : "s"}
                  </span>
                </div>
                {subscribers.length === 0 ? (
                  <p className="text-zinc-500">
                    No active subscribers yet. Add subscribers in the{" "}
                    <Link
                      href="/subscribers"
                      className="underline underline-offset-2 hover:text-zinc-200"
                    >
                      Subscribers
                    </Link>{" "}
                    page to send this EPIC as a newsletter.
                  </p>
                ) : (
                  <ul className="divide-y divide-zinc-800 rounded-md border border-zinc-800/80 bg-zinc-950/40">
                    {subscribers.map((subscriber) => (
                      <li
                        key={subscriber.id}
                        className="flex items-center justify-between gap-3 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[13px] text-zinc-100">
                            {subscriber.email}
                          </p>
                          <p className="truncate text-[11px] text-zinc-500">
                            {subscriber.name || "—"}
                          </p>
                        </div>
                        <span className="rounded-full bg-emerald-900/40 px-2 py-0.5 text-[10px] font-medium text-emerald-300 ring-1 ring-emerald-700/70">
                          Active
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-2 text-[11px] text-zinc-500">
                  Manage subscribers in the{" "}
                  <Link
                    href="/subscribers"
                    className="underline underline-offset-2 hover:text-zinc-200"
                  >
                    Subscribers
                  </Link>{" "}
                  dashboard.
                </p>
              </div>
            )}

            {referenceLinks.length > 0 ? (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-xs text-zinc-300">
                <p className="mb-2 font-medium text-zinc-200">
                  Reference Links
                </p>
                <ul className="space-y-1.5">
                  {referenceLinks.map((url) => (
                    <li key={url} className="truncate">
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-300 underline-offset-2 hover:underline"
                      >
                        {url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {mediaReferenceLinks.length > 0 ? (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-xs text-zinc-300">
                <p className="mb-2 font-medium text-zinc-200">
                  Media References
                </p>
                <ul className="space-y-1.5">
                  {mediaReferenceLinks.map((url) => (
                    <li key={url} className="truncate">
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-300 underline-offset-2 hover:underline"
                      >
                        {url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {keyPoints.length > 0 ? (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-xs text-zinc-300">
                <p className="mb-2 font-medium text-zinc-200">Key Points</p>
                <ul className="list-disc space-y-1 pl-4">
                  {keyPoints.map((point, idx) => (
                    <li key={`${point}-${idx}`}>{point}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <SocialSharePanel
              title={newsletter.subject}
              description={newsletter.description ?? undefined}
              url={publicUrl}
              imageUrl={newsletter.bannerImageUrl ?? undefined}
              hashtags={hashtags}
              compact={false}
            />

            {newsletter.contentType === "blog" ? (
              <EpicSeoPanel
                newsletterId={id}
                topic={newsletter.subject}
                tags={newsletter.tags ?? []}
                initialSeoData={epicMetadata.seo ?? {}}
              />
            ) : null}
          </div>
        </div>
      </div>

      {showRepurposePanel ? (
        <ContentRepurposingPanel
          newsletterBody={newsletter.body}
          newsletterSubject={newsletter.subject}
        />
      ) : null}
    </div>
  );
}

