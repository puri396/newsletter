import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { generateSeoResearch } from "@/lib/ai/seo-research";

const BodySchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  tags: z.array(z.string()).optional().default([]),
  targetAudience: z.string().optional(),
  /** If provided, the SEO result is saved to epicMetadata.seo on this newsletter */
  contentId: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await request.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    return NextResponse.json({ error: "Invalid input.", details: msg }, { status: 400 });
  }

  const { topic, tags, targetAudience, contentId } = parsed.data;

  const result = await generateSeoResearch({ topic, existingTags: tags, targetAudience });

  if (contentId) {
    const existing = await prisma.newsletter.findUnique({
      where: { id: contentId },
      select: { epicMetadata: true },
    });

    if (existing) {
      const currentMeta =
        (existing.epicMetadata as Record<string, unknown> | null) ?? {};

      await prisma.newsletter.update({
        where: { id: contentId },
        data: {
          epicMetadata: {
            ...currentMeta,
            seo: {
              focusKeyword: result.focusKeyword,
              keywords: result.secondaryKeywords,
              title: result.suggestedTitle,
              description: result.suggestedDescription,
              searchIntent: result.searchIntent,
              relatedQuestions: result.relatedQuestions,
            },
          },
        },
      });
    }
  }

  return NextResponse.json({ data: result });
}
