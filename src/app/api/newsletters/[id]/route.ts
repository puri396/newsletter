import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { errorResponse, ERROR_CODES } from "@/lib/api/error-response";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const statusEnum = z.enum(["draft", "scheduled", "published"]);

const SeoMetaSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  focusKeyword: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  searchIntent: z.string().optional(),
  relatedQuestions: z.array(z.string()).optional(),
});

const PatchBodySchema = z.object({
  subject: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  status: statusEnum.optional(),
  tags: z.array(z.string()).optional(),
  bannerImageUrl: z.union([z.string().min(1), z.null()]).optional(),
  logoUrl: z.union([z.string().min(1), z.null()]).optional(),
  contentType: z.enum(["newsletter", "blog", "image", "video"]).optional(),
  /** Partial SEO metadata to merge into epicMetadata.seo */
  epicMetadataSeo: SeoMetaSchema.optional(),
  /** Optional template style to persist for consistent rendering */
  epicMetadataTemplateStyle: z
    .enum(["infographicBlue", "posterDark", "formalLetter"])
    .optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        "Newsletter ID is required.",
        400,
      );
    }

    const body = await request.json();
    const parsed = PatchBodySchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.flatten().formErrors[0] ?? "Invalid body.";
      return errorResponse(ERROR_CODES.VALIDATION_ERROR, message, 400);
    }

    const newsletter = await prisma.newsletter.findUnique({
      where: { id },
    });
    if (!newsletter) {
      return errorResponse(ERROR_CODES.NOT_FOUND, "Newsletter not found.", 404);
    }

    const data: Record<string, unknown> = {};
    if (parsed.data.subject !== undefined) data.subject = parsed.data.subject.trim();
    if (parsed.data.body !== undefined) data.body = parsed.data.body.trim();
    if (parsed.data.description !== undefined) data.description = parsed.data.description?.trim() ?? null;
    if (parsed.data.status !== undefined) data.status = parsed.data.status;
    if (parsed.data.tags !== undefined) data.tags = parsed.data.tags;
    if (parsed.data.bannerImageUrl !== undefined) data.bannerImageUrl = parsed.data.bannerImageUrl;
    if (parsed.data.logoUrl !== undefined) data.logoUrl = parsed.data.logoUrl;
    if (parsed.data.contentType !== undefined) data.contentType = parsed.data.contentType;
    if (parsed.data.epicMetadataSeo !== undefined || parsed.data.epicMetadataTemplateStyle !== undefined) {
      const current = (newsletter.epicMetadata as Record<string, unknown> | null) ?? {};
      data.epicMetadata = {
        ...current,
        seo:
          parsed.data.epicMetadataSeo !== undefined
            ? parsed.data.epicMetadataSeo
            : (current.seo as unknown),
        templateStyle:
          parsed.data.epicMetadataTemplateStyle !== undefined
            ? parsed.data.epicMetadataTemplateStyle
            : (current.templateStyle as unknown),
      };
    }

    const updated = await prisma.newsletter.update({
      where: { id },
      data,
    });

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch {
    return errorResponse(
      ERROR_CODES.DATABASE_ERROR,
      "Failed to update newsletter.",
      500,
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        "Newsletter ID is required.",
        400,
      );
    }

    const newsletter = await prisma.newsletter.findUnique({
      where: { id },
    });
    if (!newsletter) {
      return errorResponse(
        ERROR_CODES.NOT_FOUND,
        "Newsletter not found.",
        404,
      );
    }

    await prisma.newsletter.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    return errorResponse(
      ERROR_CODES.DATABASE_ERROR,
      "Failed to delete newsletter.",
      500,
    );
  }
}
