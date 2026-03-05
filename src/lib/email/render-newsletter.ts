import { render } from "@react-email/render";
import React from "react";
import { NewsletterEmailTemplate } from "@/emails/NewsletterEmailTemplate";
import type { SendNewsletterEmailParams } from "./types";

// Base URL for links in emails (e.g. unsubscribe). Prefer APP_URL; neither should contain secrets.
const APP_URL =
  process.env.APP_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://localhost:3000";

export function buildUnsubscribeUrl(subscriberId: string): string {
  return `${APP_URL.replace(/\/$/, "")}/api/unsubscribe?subscriberId=${encodeURIComponent(subscriberId)}`;
}

/** Strip simple HTML tags for plain-text fallback (minimal). */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export interface RenderedNewsletter {
  html: string;
  text: string;
}

export async function renderNewsletterToHtml(
  params: SendNewsletterEmailParams,
  options?: { brand?: { name?: string; logoUrl?: string } },
): Promise<RenderedNewsletter> {
  const unsubscribeUrl = buildUnsubscribeUrl(params.subscriber.id);
  const html = await render(
    React.createElement(NewsletterEmailTemplate, {
      newsletter: {
        subject: params.newsletter.subject,
        description: params.newsletter.description,
        body: params.newsletter.body,
        bannerImageUrl: params.newsletter.bannerImageUrl ?? undefined,
      },
      subscriber: {
        email: params.subscriber.email,
        name: params.subscriber.name,
      },
      unsubscribeUrl,
      brand: options?.brand,
    }),
  );
  const text = [
    params.newsletter.subject,
    params.newsletter.description ?? "",
    stripHtml(params.newsletter.body),
    "",
    `Unsubscribe: ${unsubscribeUrl}`,
  ]
    .filter(Boolean)
    .join("\n\n");
  return { html, text };
}
