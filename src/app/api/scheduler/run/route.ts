import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendNewsletterEmail, EMAIL_PROVIDER_NAME } from "@/lib/email";
import { errorResponse, ERROR_CODES } from "@/lib/api/error-response";
import { log } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  try {
    const now = new Date();

    const pending = await prisma.schedule.findMany({
      where: {
        status: "pending",
        sendAt: { lte: now },
      },
      orderBy: { sendAt: "asc" },
    });

    if (pending.length === 0) {
      return NextResponse.json(
        { processed: 0, sent: 0, failed: 0 },
        { status: 200 },
      );
    }

    let totalSent = 0;
    let totalFailed = 0;

    for (const schedule of pending) {
      const updated = await prisma.schedule.updateMany({
        where: { id: schedule.id, status: "pending" },
        data: { status: "sending" },
      });
      if (updated.count === 0) {
        continue;
      }

      let scheduleSent = 0;
      let scheduleFailed = 0;
      let lastError: string | null = null;

      try {
        const newsletter = await prisma.newsletter.findUnique({
          where: { id: schedule.newsletterId },
        });
        if (!newsletter) {
          await prisma.schedule.update({
            where: { id: schedule.id },
            data: { status: "failed", errorMessage: "Newsletter not found." },
          });
          continue;
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
            scheduleSent += 1;
          } else {
            scheduleFailed += 1;
            lastError = result.success ? null : result.error;
          }
        }

        const allSucceeded = scheduleFailed === 0;
        await prisma.$transaction([
          prisma.schedule.update({
            where: { id: schedule.id },
            data: {
              status: allSucceeded ? "sent" : "failed",
              errorMessage: allSucceeded ? null : lastError ?? "Partial failure",
            },
          }),
          ...(allSucceeded
            ? [
                prisma.newsletter.update({
                  where: { id: schedule.newsletterId },
                  data: { status: "published" as const },
                }),
              ]
            : []),
        ]);

        totalSent += scheduleSent;
        totalFailed += scheduleFailed;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        log("error", "Scheduler schedule failed", {
          scheduleId: schedule.id,
          errorMessage: message,
        });
        await prisma.schedule.update({
          where: { id: schedule.id },
          data: { status: "failed", errorMessage: message },
        });
      }
    }

    return NextResponse.json(
      {
        processed: pending.length,
        sent: totalSent,
        failed: totalFailed,
      },
      { status: 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log("error", "Scheduler run failed", {
      context: "scheduler/run",
      errorMessage: message,
    });
    return errorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      "Scheduler run failed.",
      500,
    );
  }
}
