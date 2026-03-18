import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { errorResponse, ERROR_CODES } from "@/lib/api/error-response";
import { log } from "@/lib/logger";

const statusEnum = z.enum(["draft", "scheduled", "published", "archived"]);

const PatchSchema = z.object({
  status: statusEnum,
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const newsletter = await prisma.newsletter.findUnique({
      where: { id },
    });

    if (!newsletter) {
      return errorResponse(
        ERROR_CODES.NOT_FOUND,
        "EPIC content not found.",
        404,
      );
    }

    const epicMeta =
      (newsletter.epicMetadata as
        | {
            tone?: unknown;
            aiProvider?: unknown;
            referenceLinks?: unknown;
            mediaReferenceLinks?: unknown;
          }
        | null) ?? {};

    const referenceLinks = Array.isArray(epicMeta.referenceLinks)
      ? (epicMeta.referenceLinks as string[])
      : [];
    const mediaReferenceLinks = Array.isArray(epicMeta.mediaReferenceLinks)
      ? (epicMeta.mediaReferenceLinks as string[])
      : [];

    const data = {
      id: newsletter.id,
      type: (newsletter.contentType ?? "newsletter") as
        | "newsletter"
        | "blog"
        | "image"
        | "video",
      title: newsletter.shortTitle ?? newsletter.subject,
      description: newsletter.description ?? "",
      tone:
        typeof epicMeta.tone === "string" && epicMeta.tone.trim()
          ? (epicMeta.tone as string)
          : null,
      aiProvider:
        typeof epicMeta.aiProvider === "string" && epicMeta.aiProvider.trim()
          ? (epicMeta.aiProvider as string)
          : null,
      aiModel: newsletter.aiModel ?? null,
      referenceLinks,
      mediaReferenceLinks,
      status: newsletter.status,
      body: newsletter.body,
      // raw fields for advanced cases
      contentType: newsletter.contentType,
      epicMetadata: newsletter.epicMetadata,
    };

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("error", "Failed to load EPIC content", {
      context: "api/epic/content/[id] GET",
      errorMessage: message,
    });
    return errorResponse(
      ERROR_CODES.DATABASE_ERROR,
      "Failed to load EPIC content.",
      500,
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const raw = await request.json().catch(() => ({}));
    const parsed = PatchSchema.safeParse(raw);
    if (!parsed.success) {
      const first = parsed.error.flatten().formErrors[0];
      const message = typeof first === "string" ? first : "Invalid input.";
      return errorResponse(ERROR_CODES.VALIDATION_ERROR, message, 400);
    }

    const updated = await prisma.newsletter.update({
      where: { id },
      data: {
        status: parsed.data.status,
        ...(parsed.data.status === "published"
          ? { publishedAt: new Date() }
          : {}),
      },
    });

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("error", "Failed to update content status", {
      context: "api/epic/content/[id] PATCH",
      errorMessage: message,
    });
    return errorResponse(
      ERROR_CODES.DATABASE_ERROR,
      "Failed to update content.",
      500,
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await prisma.newsletter.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("error", "Failed to delete content", {
      context: "api/epic/content/[id] DELETE",
      errorMessage: message,
    });
    return errorResponse(
      ERROR_CODES.DATABASE_ERROR,
      "Failed to delete content.",
      500,
    );
  }
}
