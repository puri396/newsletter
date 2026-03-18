import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { errorResponse, ERROR_CODES } from "@/lib/api/error-response";
import {
  isWhatsAppConfigured,
  getWhatsAppConfig,
  sendWhatsAppTemplate,
  buildNewsletterTemplateParams,
} from "@/lib/whatsapp";
import { getWhatsAppRecipients } from "@/lib/subscribers/whatsapp";
import { log } from "@/lib/logger";
// #region agent log
function dbgWrite(label: string, obj: Record<string, unknown>) { console.error("[WA-DBG]", label, JSON.stringify(obj)); }
// #endregion

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/newsletters/[id]/whatsapp-broadcast
 * Sends this newsletter as a WhatsApp template message to all eligible subscribers
 * (status=active, whatsappOptIn=true, phone set). Does not change newsletter status.
 */
export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  // #region agent log
  dbgWrite('ENTRY', {cwd:process.cwd()});
  // #endregion
  try {
    const { id: newsletterId } = await context.params;
    if (!newsletterId) {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        "Newsletter ID is required.",
        400,
      );
    }

    if (!isWhatsAppConfigured()) {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        "WhatsApp is not configured. Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID.",
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

    const configResult = getWhatsAppConfig();
    if (!configResult.configured) {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        configResult.error,
        400,
      );
    }

    const waRecipients = await getWhatsAppRecipients();
    const templateName = configResult.config.templateName;
    const templateParams = buildNewsletterTemplateParams(
      newsletter.subject,
      newsletter.id,
    );

    // #region agent log
    dbgWrite('BROADCAST-START', {recipientCount:waRecipients.length,phones:waRecipients.map(r=>r.phone.slice(-6)),templateName,templateParams});
    // #endregion

    let sent = 0;
    let failed = 0;
    for (const sub of waRecipients) {
      const result = await sendWhatsAppTemplate(
        sub.phone,
        templateName,
        templateParams,
      );

      // #region agent log
      dbgWrite('SEND-RESULT', {phoneLast6:sub.phone.slice(-6),success:!!result.messageId,error:('error' in result)?result.error:null});
      // #endregion

      if (result.messageId) {
        sent += 1;
      } else {
        failed += 1;
        log("error", "WhatsApp broadcast send failed", {
          context: "whatsapp-broadcast",
          newsletterId,
          toLast4: sub.phone.slice(-4),
          error: result.error,
        });
      }
    }

    return NextResponse.json(
      { success: true, sent, failed },
      { status: 200 },
    );
  } catch {
    return errorResponse(
      ERROR_CODES.DATABASE_ERROR,
      "Failed to send WhatsApp broadcast.",
      500,
    );
  }
}
