import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { errorResponse, ERROR_CODES } from "@/lib/api/error-response";
import { log } from "@/lib/logger";

const statusEnum = z.enum(["draft", "scheduled", "published"]);

const CreateBodySchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  description: z.string().optional(),
  status: statusEnum.optional().default("draft"),
  tags: z.array(z.string()).optional().default([]),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status") ?? undefined;
    const status = statusParam
      ? statusEnum.safeParse(statusParam.toLowerCase()).success
        ? (statusParam.toLowerCase() as "draft" | "scheduled" | "published")
        : undefined
      : undefined;

    const newsletters = await prisma.newsletter.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      {
        data: newsletters,
      },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("error", "Failed to load newsletters", {
      context: "api/newsletters GET",
      errorMessage: message,
    });
    return errorResponse(
      ERROR_CODES.DATABASE_ERROR,
      "Failed to load newsletters.",
      500,
    );
  }
}

export async function POST(request: Request) {
  try {
    const raw = await request.json().catch(() => ({}));
    const parsed = CreateBodySchema.safeParse(raw);
    if (!parsed.success) {
      const first = parsed.error.flatten().formErrors[0];
      const message = typeof first === "string" ? first : "Invalid input.";
      return errorResponse(ERROR_CODES.VALIDATION_ERROR, message, 400);
    }
    const { subject, body, description, status, tags } = parsed.data;

    const created = await prisma.newsletter.create({
      data: {
        subject: subject.trim(),
        body: body.trim(),
        description: description?.trim() || null,
        status,
        tags,
      },
    });

    return NextResponse.json(
      {
        data: created,
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("error", "Failed to create newsletter", {
      context: "api/newsletters POST",
      errorMessage: message,
    });
    return errorResponse(
      ERROR_CODES.DATABASE_ERROR,
      "Failed to create newsletter.",
      500,
    );
  }
}
