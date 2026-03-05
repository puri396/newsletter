import { log } from "@/lib/logger";
import { resendProvider, getFromEmail } from "./provider-resend";
import { renderNewsletterToHtml } from "./render-newsletter";
import type {
  SendNewsletterEmailParams,
  SendNewsletterEmailResponse,
} from "./types";

async function sendOnce(params: SendNewsletterEmailParams): Promise<SendNewsletterEmailResponse> {
  const { html, text } = await renderNewsletterToHtml(params);
  const from = getFromEmail();
  const result = await resendProvider.send({
    from,
    to: params.subscriber.email,
    subject: params.newsletter.subject,
    html,
    text,
  });
  return { success: true, messageId: result.id };
}

export async function sendNewsletterEmail(
  params: SendNewsletterEmailParams,
): Promise<SendNewsletterEmailResponse> {
  try {
    return await sendOnce(params);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to send email";
    log("error", "sendNewsletterEmail failed", {
      context: "sendNewsletterEmail",
      error: message,
    });
    try {
      return await sendOnce(params);
    } catch {
      return { success: false, error: message };
    }
  }
}
