import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { NewsletterEditor } from "@/components/newsletter";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EpicMediaEditor } from "@/components/epic/EpicMediaEditor";

interface EpicEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EpicEditPage({ params }: EpicEditPageProps) {
  const { id } = await params;

  const newsletter = await prisma.newsletter.findUnique({
    where: { id },
  });

  if (!newsletter) {
    notFound();
  }

  const contentTypeLabel = newsletter.contentType
    ? newsletter.contentType.charAt(0).toUpperCase() +
      newsletter.contentType.slice(1)
    : "Newsletter";

  const epicMetadata =
    (newsletter.epicMetadata as
      | {
          tone?: string;
          aiProvider?: string;
          referenceLinks?: string[];
          mediaReferenceLinks?: string[];
          keyPoints?: string[];
          hashtags?: string[];
        }
      | null) ?? {};

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <Link href="/epic" className="hover:text-zinc-100">
          EPIC
        </Link>
        <span aria-hidden>/</span>
        <Link
          href={`/epic/view/${id}`}
          className="max-w-[200px] truncate hover:text-zinc-100 lg:max-w-md"
          title={newsletter.shortTitle ?? newsletter.subject}
        >
          {newsletter.shortTitle ?? newsletter.subject}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-zinc-500">Edit</span>
      </div>

      {(newsletter.contentType === null ||
        newsletter.contentType === undefined ||
        newsletter.contentType === "newsletter" ||
        newsletter.contentType === "blog") && (
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 lg:p-5">
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
                  <span className="inline-flex items-center rounded-full border border-zinc-700 px-2 py-0.5 text-[11px] uppercase tracking-wide text-zinc-300">
                    {contentTypeLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <NewsletterEditor
            initialValues={{
              title: newsletter.subject,
              description: newsletter.description ?? "",
              body: newsletter.body,
              tagsInput: newsletter.tags.join(", "),
              status: newsletter.status,
              newsletterId: newsletter.id,
              bannerImageUrl: newsletter.bannerImageUrl,
            }}
            previewStyle={
              (epicMetadata as { templateStyle?: string } | null)
                ?.templateStyle as any
            }
          />
        </div>
      )}

      {(newsletter.contentType === "image" ||
        newsletter.contentType === "video") && (
        <EpicMediaEditor
          newsletterId={newsletter.id}
          subject={newsletter.subject}
          description={newsletter.description}
          body={newsletter.body}
          status={newsletter.status}
          contentType={newsletter.contentType as "image" | "video"}
          bannerImageUrl={newsletter.bannerImageUrl}
          epicMetadata={epicMetadata}
        />
      )}
    </div>
  );
}

