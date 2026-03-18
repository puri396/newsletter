import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendNewsletterEmail, EMAIL_PROVIDER_NAME } from "@/lib/email";
import { uniqueSlug } from "@/lib/slug";
import { errorResponse, ERROR_CODES } from "@/lib/api/error-response";
import {
  isWhatsAppConfigured,
  getWhatsAppConfig,
  sendWhatsAppTemplate,
  buildNewsletterTemplateParams,
} from "@/lib/whatsapp";
import { getWhatsAppRecipients } from "@/lib/subscribers/whatsapp";
import { log } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  _request: Request,
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

    if (newsletter.status === "published") {
      return NextResponse.json(
        { sent: 0, failed: 0, message: "Already published." },
        { status: 200 },
      );
    }

    const subscribers = await prisma.subscriber.findMany({
      where: { status: "active" },
    });

    const newsletterPayload = {
      id: newsletter.id,
      subject: newsletter.subject,
      description: newsletter.description,
      body: newsletter.body,
      bannerImageUrl: newsletter.bannerImageUrl ?? undefined,
      logoUrl: newsletter.logoUrl ?? undefined,
      contentType: newsletter.contentType ?? "newsletter",
      authorName: newsletter.authorName ?? undefined,
      publishedAt: newsletter.publishedAt ?? new Date(),
    };

    let sent = 0;
    let failed = 0;

    for (const subscriber of subscribers) {
      const result = await sendNewsletterEmail({
        newsletter: newsletterPayload,
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
        log("error", "Failed to send email to subscriber in publish-now", {
          context: "publish-now",
          newsletterId,
          subscriberId: subscriber.id,
        });
      }
    }

    let whatsappSent = 0;
    let whatsappFailed = 0;
    if (isWhatsAppConfigured()) {
      const waRecipients = await getWhatsAppRecipients();
      const configResult = getWhatsAppConfig();
      if (configResult.configured) {
        const templateName = configResult.config.templateName;
        const templateParams = buildNewsletterTemplateParams(
          newsletter.subject,
          newsletter.id,
        );
        for (const sub of waRecipients) {
          const result = await sendWhatsAppTemplate(
            sub.phone,
            templateName,
            templateParams,
          );
          if (result.messageId) {
            whatsappSent += 1;
          } else {
            whatsappFailed += 1;
            log("error", "WhatsApp send failed in publish-now", {
              context: "publish-now",
              newsletterId,
              toLast4: sub.phone.slice(-4),
              error: result.error,
            });
          }
        }
      }
    }

    // Auto-generate a slug for blog posts that don't have one yet
    let slug = newsletter.slug ?? null;
    if (newsletter.contentType === "blog" && !slug) {
      slug = await uniqueSlug(newsletter.subject, async (s) => {
        const existing = await prisma.newsletter.findFirst({ where: { slug: s } });
        return !!existing;
      });
    }

    await prisma.$transaction([
      prisma.newsletter.update({
        where: { id: newsletterId },
        data: {
          status: "published",
          publishedAt: new Date(),
          ...(slug ? { slug } : {}),
        },
      }),
      prisma.schedule.create({
        data: {
          newsletterId,
          sendAt: new Date(),
          status: "sent",
        },
      }),
    ]);

    return NextResponse.json(
      { sent, failed, whatsappSent, whatsappFailed, slug },
      { status: 200 },
    );
  } catch {
    return errorResponse(
      ERROR_CODES.DATABASE_ERROR,
      "Failed to publish newsletter.",
      500,
    );
  }
}
