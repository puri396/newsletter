import { notFound } from "next/navigation";
import Link from "next/link";
import { getImageTemplate } from "@/lib/image/templates";
import { ImageCreatorForm } from "./ImageCreatorForm";

interface PageProps {
  params: Promise<{ templateId: string }>;
}

export default async function ImageTemplatePage({ params }: PageProps) {
  const { templateId } = await params;
  const template = getImageTemplate(templateId);

  if (!template) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-50">
            {template.id === "blank" ? "Create Image" : template.name}
          </h2>
          <p className="mt-1 text-sm text-zinc-400">{template.description}</p>
        </div>
        <Link
          href="/images"
          className="shrink-0 text-xs text-zinc-500 underline-offset-2 hover:text-zinc-300 hover:underline"
        >
          ← Back to Browse Images
        </Link>
      </div>

      <ImageCreatorForm
        defaultPrompt={template.defaultPrompt}
        templateName={template.name}
        exampleStyle={template.exampleStyle}
      />
    </div>
  );
}
