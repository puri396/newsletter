import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { errorResponse, ERROR_CODES } from "@/lib/api/error-response";
import { log } from "@/lib/logger";

const BodySchema = z.object({
  sendAt: z
    .string()
    .min(1, "sendAt (ISO date string) is required")
    .transform((s) => new Date(s.trim()))
    .refine((d) => !Number.isNaN(d.getTime()), {
      message: "sendAt must be a valid date.",
    })
    .refine((d) => d > new Date(), {
      message: "sendAt must be in the future.",
    }),
});

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: newsletterId } = await context.params;
    if (!newsletterId) {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        "Newsletter ID is required.",
        400,
      );
    }

    const raw = await request.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      const first = parsed.error.flatten().formErrors[0];
      const message = typeof first === "string" ? first : "Invalid input.";
      return errorResponse(ERROR_CODES.VALIDATION_ERROR, message, 400);
    }
    const { sendAt } = parsed.data;

    const newsletter = await prisma.newsletter.findUnique({
      where: { id: newsletterId },
      include: {
        schedules: {
          where: { status: "pending" },
          take: 1,
        },
      },
    });
    if (!newsletter) {
      return errorResponse(ERROR_CODES.NOT_FOUND, "Newsletter not found.", 404);
    }
    if (newsletter.schedules.length > 0) {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        "Newsletter already has a pending schedule.",
        400,
      );
    }

    const [schedule] = await prisma.$transaction([
      prisma.schedule.create({
        data: {
          newsletterId,
          sendAt,
          status: "pending",
        },
      }),
      prisma.newsletter.update({
        where: { id: newsletterId },
        data: { status: "scheduled" },
      }),
    ]);

    return NextResponse.json({ data: schedule }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("error", "Failed to schedule newsletter", {
      context: "api/newsletters/[id]/schedule",
      errorMessage: message,
    });
    return errorResponse(
      ERROR_CODES.DATABASE_ERROR,
      "Failed to schedule newsletter.",
      500,
    );
  }
}
