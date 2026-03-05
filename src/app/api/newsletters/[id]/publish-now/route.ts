import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendNewsletterEmail, EMAIL_PROVIDER_NAME } from "@/lib/email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  _request: Request,
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

    const newsletter = await prisma.newsletter.findUnique({
      where: { id: newsletterId },
    });
    if (!newsletter) {
      return NextResponse.json(
        { error: "Newsletter not found." },
        { status: 404 },
      );
    }

    if (newsletter.status === "published") {
      return NextResponse.json(
        { sent: 0, failed: 0, message: "Already published." },
        { status: 200 },
      );
    }

    const subscribers = await prisma.subscriber.findMany({
      where: { status: "active" },
    });

    const payload = {
      newsletter: {
        id: newsletter.id,
        subject: newsletter.subject,
        description: newsletter.description,
        body: newsletter.body,
        bannerImageUrl: newsletter.bannerImageUrl ?? undefined,
      },
    };

    let sent = 0;
    let failed = 0;

    for (const subscriber of subscribers) {
      const result = await sendNewsletterEmail({
        ...payload,
        subscriber: {
          id: subscriber.id,
          email: subscriber.email,
          name: subscriber.name,
        },
      });
      if (result.success && result.messageId) {
        await prisma.emailLog.create({
          data: {
            newsletterId: newsletter.id,
            subscriberId: subscriber.id,
            provider: EMAIL_PROVIDER_NAME,
            providerMessageId: result.messageId,
            status: "sent",
            deliveredAt: new Date(),
          },
        });
        sent += 1;
      } else {
        failed += 1;
      }
    }

    await prisma.$transaction([
      prisma.newsletter.update({
        where: { id: newsletterId },
        data: { status: "published" },
      }),
      prisma.schedule.create({
        data: {
          newsletterId,
          sendAt: new Date(),
          status: "sent",
        },
      }),
    ]);

    return NextResponse.json({ sent, failed }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to publish newsletter." },
      { status: 500 },
    );
  }
}
