import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogTemplateById } from "@/lib/blog/templates";
import { NewsletterEditor } from "@/components/newsletter";

interface BlogTemplateEditorPageProps {
  params: Promise<{ templateId: string }>;
}

export default async function BlogTemplateEditorPage({
  params,
}: BlogTemplateEditorPageProps) {
  const { templateId } = await params;
  const template = getBlogTemplateById(templateId);

  if (!template) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Link href="/epic" className="hover:text-zinc-100">
              Content Studio
            </Link>
            <span aria-hidden>/</span>
            <Link href="/epic/templates" className="hover:text-zinc-100">
              Blog Templates
            </Link>
            <span aria-hidden>/</span>
            <span className="text-zinc-500">{template.name}</span>
          </div>
          <h2 className="mt-2 text-lg font-semibold text-zinc-50">
            {template.name}
          </h2>
          <p className="mt-0.5 text-sm text-zinc-400">
            {template.description}
          </p>
        </div>
      </div>

      <div className="rounded-md border border-amber-800/40 bg-amber-950/20 px-4 py-3 text-xs text-amber-200">
        You are editing a blog template. Clicking <strong>Save Draft</strong>{" "}
        will create a new blog draft with your changes.
      </div>

      <NewsletterEditor
        initialValues={{
          title: template.initialValues.title,
          description: template.initialValues.description,
          body: template.initialValues.body,
          tagsInput: template.initialValues.tagsInput,
          bannerImageUrl: template.initialValues.bannerImageUrl ?? null,
        }}
        previewStyle={template.style}
        contentType="blog"
      />
    </div>
  );
}

