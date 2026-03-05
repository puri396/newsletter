import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { errorResponse, ERROR_CODES } from "@/lib/api/error-response";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const statusEnum = z.enum(["draft", "scheduled", "published"]);

const PatchBodySchema = z.object({
  subject: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  status: statusEnum.optional(),
  tags: z.array(z.string()).optional(),
  bannerImageUrl: z.union([z.string().url(), z.null()]).optional(),
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
      return NextResponse.json(
        { error: "Newsletter ID is required." },
        { status: 400 },
      );
    }

    const newsletter = await prisma.newsletter.findUnique({
      where: { id },
    });
    if (!newsletter) {
      return NextResponse.json(
        { error: "Newsletter not found." },
        { status: 404 },
      );
    }

    await prisma.newsletter.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete newsletter." },
      { status: 500 },
    );
  }
}
