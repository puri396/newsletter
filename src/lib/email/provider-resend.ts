import { Resend } from "resend";
import type { EmailProvider } from "./types";

/** Provider name for EmailLog and logging; use this constant when creating EmailLog. */
export const EMAIL_PROVIDER_NAME = "resend";

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.FROM_EMAIL ?? "Newsletter <onboarding@resend.dev>";

function getResendClient(): Resend {
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }
  return new Resend(apiKey);
}

export const resendProvider: EmailProvider = {
  async send(params) {
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: params.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });
    if (error) {
      throw new Error(error.message);
    }
    if (!data?.id) {
      throw new Error("Resend did not return a message id");
    }
    return { id: data.id };
  },
};

export function getFromEmail(): string {
  return fromEmail;
}
