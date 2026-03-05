/**
 * Core send API: template messages. Delegates to configured provider (Meta Cloud by default).
 * Never throws; returns structured result for caller to handle.
 */

import { log } from "@/lib/logger";
import { getWhatsAppConfig } from "./config";
import { sendTemplateMeta } from "./providers/meta-cloud";

export interface SendTemplateSuccess {
  messageId: string;
}

export interface SendTemplateFailure {
  error: string;
}

export type SendTemplateResult = SendTemplateSuccess | SendTemplateFailure;

/**
 * Sends a WhatsApp template message to the given E.164 number.
 * Uses env-driven config (WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, optional WHATSAPP_TEMPLATE_NAME).
 *
 * @param to - Recipient phone in E.164 (e.g. +15551234567)
 * @param templateName - Template name as approved in Meta Business Manager
 * @param templateParams - Ordered list of string parameters for the template body (e.g. [subject, link])
 * @returns { messageId } on success, or { error } on failure. Does not throw.
 */
export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  templateParams: string[],
): Promise<SendTemplateResult> {
  const configResult = getWhatsAppConfig();

  if (!configResult.configured) {
    return { error: configResult.error };
  }

  const { config } = configResult;

  const result = await sendTemplateMeta({
    accessToken: config.accessToken,
    phoneNumberId: config.phoneNumberId,
    to,
    templateName,
    templateParams,
  });

  if (result.success) {
    return { messageId: result.messageId };
  }

  log("error", "WhatsApp send failed", {
    context: "whatsapp/send",
    toLast4: to.slice(-4),
    error: result.error,
  });
  return { error: result.error };
}
