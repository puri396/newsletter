import { render } from "@react-email/render";
import React from "react";
import { log } from "@/lib/logger";
import { resendProvider, getFromEmail } from "./provider-resend";
import { WelcomeEmailTemplate } from "@/emails/WelcomeEmailTemplate";

const APP_URL =
  process.env.APP_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://localhost:3000";

export interface SendWelcomeEmailParams {
  email: string;
  name?: string | null;
}

export interface SendWelcomeEmailResult {
  success: boolean;
  error?: string;
}

async function sendOnce({
  email,
  name,
}: SendWelcomeEmailParams): Promise<SendWelcomeEmailResult> {
  const from = getFromEmail();

  const appUrl = APP_URL.replace(/\/$/, "");
  const html = await render(
    React.createElement(WelcomeEmailTemplate, {
      subscriber: { email, name },
      appUrl,
    }),
  );

  const textLines = [
    "Welcome to GenContent AI",
    "",
    "Thanks for subscribing. You will receive AI-crafted newsletters with updates and insights.",
    "",
    `You can always return to your dashboard at: ${appUrl}`,
  ];

  const text = textLines.join("\n");

  const result = await resendProvider.send({
    from,
    to: email,
    subject: "Welcome to GenContent AI",
    html,
    text,
  });

  return { success: true, error: undefined };
}

export async function sendWelcomeEmail(
  params: SendWelcomeEmailParams,
): Promise<SendWelcomeEmailResult> {
  try {
    return await sendOnce(params);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send welcome email";
    log("error", "sendWelcomeEmail failed", {
      context: "sendWelcomeEmail",
      error: message,
    });
    return { success: false, error: message };
  }
}

