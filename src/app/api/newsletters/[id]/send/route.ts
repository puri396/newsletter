import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendNewsletterEmail } from "@/lib/email";
import { errorResponse, ERROR_CODES } from "@/lib/api/error-response";

interface SendBody {
  subscriberId?: string;
}

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

    const body = (await request.json().catch(() => ({}))) as SendBody;
    const subscriberId = typeof body.subscriberId === "string" ? body.subscriberId.trim() : undefined;
    if (!subscriberId) {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        "subscriberId is required in body.",
        400,
      );
    }

    const newsletter = await prisma.newsletter.findUnique({
      where: { id: newsletterId },
    });
    if (!newsletter) {
      return errorResponse(
        ERROR_CODES.NOT_FOUND,
        "Newsletter not found.",
        404,
      );
    }

    const subscriber = await prisma.subscriber.findUnique({
      where: { id: subscriberId },
    });
    if (!subscriber) {
      return errorResponse(
        ERROR_CODES.NOT_FOUND,
        "Subscriber not found.",
        404,
      );
    }
    if (subscriber.status !== "active") {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        "Subscriber is not active.",
        400,
      );
    }

    const result = await sendNewsletterEmail({
      newsletter: {
        id: newsletter.id,
        subject: newsletter.subject,
        description: newsletter.description,
        body: newsletter.body,
        bannerImageUrl: newsletter.bannerImageUrl ?? undefined,
      },
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        name: subscriber.name,
      },
    });

    if (!result.success) {
      return errorResponse(
        ERROR_CODES.EMAIL_FAILED,
        result.error || "Failed to send newsletter email.",
        502,
      );
    }

    return NextResponse.json(
      { success: true, messageId: result.messageId },
      { status: 200 },
    );
  } catch {
    return errorResponse(
      ERROR_CODES.DATABASE_ERROR,
      "Failed to send newsletter.",
      500,
    );
  }
}
