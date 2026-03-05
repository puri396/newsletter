import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendNewsletterEmail } from "@/lib/email";

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
      return NextResponse.json(
        { error: "Newsletter ID is required." },
        { status: 400 },
      );
    }

    const body = (await request.json()).catch(() => ({})) as SendBody;
    const subscriberId = typeof body.subscriberId === "string" ? body.subscriberId.trim() : undefined;
    if (!subscriberId) {
      return NextResponse.json(
        { error: "subscriberId is required in body." },
        { status: 400 },
      );
    }

    const newsletter = await prisma.newsletter.findUnique({
      where: { id: newsletterId },
    });
    if (!newsletter) {
      return NextResponse.json(
        { error: "Newsletter not found." },
        { status: 404 },
      );
    }

    const subscriber = await prisma.subscriber.findUnique({
      where: { id: subscriberId },
    });
    if (!subscriber) {
      return NextResponse.json(
        { error: "Subscriber not found." },
        { status: 404 },
      );
    }
    if (subscriber.status !== "active") {
      return NextResponse.json(
        { error: "Subscriber is not active." },
        { status: 400 },
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
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { success: true, messageId: result.messageId },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to send newsletter." },
      { status: 500 },
    );
  }
}
