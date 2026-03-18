import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { NewsletterEditor } from "@/components/newsletter";

interface EditNewsletterPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditNewsletterPage({
  params,
}: EditNewsletterPageProps) {
  const { id } = await params;

  const newsletter = await prisma.newsletter.findUnique({
    where: { id },
  });

  if (!newsletter) {
    notFound();
  }

  if (newsletter.status !== "draft") {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <Link href="/newsletters" className="hover:text-zinc-100">
          Create Newsletter
        </Link>
        <span aria-hidden>/</span>
        <Link
          href={`/newsletters/${id}`}
          className="hover:text-zinc-100 truncate max-w-[200px] lg:max-w-md"
          title={newsletter.subject}
        >
          {newsletter.subject}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-zinc-500">Edit</span>
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
          (newsletter.epicMetadata as { templateStyle?: string } | null)
            ?.templateStyle as any
        }
      />
    </div>
  );
}
