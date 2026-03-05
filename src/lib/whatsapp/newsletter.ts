/**
 * Newsletter-specific helpers for WhatsApp: URL building and template param mapping.
 */

import { getBaseUrl } from "./config";

/**
 * Builds the full URL for a newsletter (e.g. for "read more" in WhatsApp).
 * Uses APP_URL or NEXT_PUBLIC_APP_URL; no trailing slash.
 */
export function buildNewsletterUrl(newsletterId: string): string {
  const base = getBaseUrl();
  return `${base}/newsletters/${encodeURIComponent(newsletterId)}`;
}

/**
 * Builds the template params array for a "new newsletter" template.
 * Order must match the template defined in Meta Business Manager (e.g. {{1}} = subject, {{2}} = link).
 */
export function buildNewsletterTemplateParams(
  subject: string,
  newsletterId: string,
): string[] {
  const link = buildNewsletterUrl(newsletterId);
  return [subject, link];
}
