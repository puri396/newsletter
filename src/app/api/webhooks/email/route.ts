import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PROVIDER_RESEND = "resend";

type ResendEventType =
  | "email.sent"
  | "email.delivered"
  | "email.delivery_delayed"
  | "email.opened"
  | "email.clicked"
  | "email.bounced"
  | "email.complained"
  | "email.failed"
  | string;

interface ResendWebhookPayload {
  type?: ResendEventType;
  data?: { email_id?: string };
}

function getProviderMessageId(payload: ResendWebhookPayload): string | null {
  const id = payload.data?.email_id;
  return typeof id === "string" && id.trim() ? id.trim() : null;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const secret = process.env.RESEND_WEBHOOK_SECRET;

  if (secret) {
    try {
      const wh = new Webhook(secret);
      wh.verify(rawBody, {
        "svix-id": request.headers.get("svix-id") ?? "",
        "svix-timestamp": request.headers.get("svix-timestamp") ?? "",
        "svix-signature": request.headers.get("svix-signature") ?? "",
      });
    } catch {
      return new NextResponse("Invalid webhook signature", { status: 401 });
    }
  } else {
    console.warn("[webhooks/email] RESEND_WEBHOOK_SECRET not set; skipping verification");
  }

  let payload: ResendWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as ResendWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const providerMessageId = getProviderMessageId(payload);
  if (!providerMessageId) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const log = await prisma.emailLog.findUnique({
    where: {
      provider_providerMessageId: {
        provider: PROVIDER_RESEND,
        providerMessageId,
      },
    },
  });

  if (!log) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const type = payload.type ?? "";
  const now = new Date();

  const statusOrder: Record<string, number> = {
    pending: 0,
    sent: 1,
    delivered: 2,
    opened: 3,
    clicked: 4,
    failed: 5,
  };
  const currentOrder = statusOrder[log.status] ?? 0;

  if (type === "email.delivered" && currentOrder < 2) {
    await prisma.emailLog.update({
      where: { id: log.id },
      data: {
        status: "delivered",
        deliveredAt: now,
        opened: false,
        clicked: false,
      },
    });
  } else if (type === "email.opened" && currentOrder < 3) {
    await prisma.emailLog.update({
      where: { id: log.id },
      data: {
        status: "opened",
        openedAt: now,
        opened: true,
      },
    });
  } else if (type === "email.clicked") {
    await prisma.emailLog.update({
      where: { id: log.id },
      data: {
        status: "clicked",
        clickedAt: now,
        clicked: true,
      },
    });
  } else if (
    (type === "email.bounced" || type === "email.complained" || type === "email.failed") &&
    currentOrder < 5
  ) {
    await prisma.emailLog.update({
      where: { id: log.id },
      data: { status: "failed" },
    });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
