import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendNewsletterEmail } from "@/lib/email";

interface TestBody {
  newsletterId?: string;
  to?: string;
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()).catch(() => ({})) as TestBody;
    const newsletterId = typeof body.newsletterId === "string" ? body.newsletterId.trim() : undefined;
    const to = typeof body.to === "string" ? body.to.trim() : undefined;

    if (!newsletterId) {
      return NextResponse.json(
        { error: "newsletterId is required in body." },
        { status: 400 },
      );
    }

    const recipient = to ?? process.env.TEST_EMAIL?.trim();
    if (!recipient) {
      return NextResponse.json(
        { error: "Either provide 'to' in body or set TEST_EMAIL." },
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

    const result = await sendNewsletterEmail({
      newsletter: {
        id: newsletter.id,
        subject: newsletter.subject,
        description: newsletter.description,
        body: newsletter.body,
      },
      subscriber: {
        id: "test",
        email: recipient,
        name: null,
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
      { error: "Failed to send test email." },
      { status: 500 },
    );
  }
}
