/**
 * Environment-driven configuration for WhatsApp integration (Meta Cloud API).
 * Safe access; no throwing. Callers check isConfigured() before sending.
 *
 * Required env vars:
 * - WHATSAPP_ACCESS_TOKEN: Meta Cloud API access token (from developers.facebook.com / Meta Business Manager).
 * - WHATSAPP_PHONE_NUMBER_ID: WhatsApp Business phone number ID from Meta.
 *
 * Optional:
 * - WHATSAPP_TEMPLATE_NAME: Template name approved in Meta Business Manager (default: "new_newsletter").
 *   Template body should have {{1}} = subject, {{2}} = link (see buildNewsletterTemplateParams).
 */

export interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  templateName: string;
}

export interface ConfigResult {
  configured: true;
  config: WhatsAppConfig;
}

export interface ConfigNotConfigured {
  configured: false;
  error: string;
}

export type WhatsAppConfigResult = ConfigResult | ConfigNotConfigured;

/** Base URL for the app (newsletter links, etc.). Prefer APP_URL; fallback NEXT_PUBLIC_APP_URL then localhost. */
export function getBaseUrl(): string {
  const url =
    process.env.APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "";
  if (url) return url.replace(/\/$/, "");
  return "http://localhost:3000";
}

/**
 * Reads WhatsApp config from env. Returns configured config or a clear error message.
 * Does not throw.
 */
export function getWhatsAppConfig(): WhatsAppConfigResult {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();

  if (!accessToken) {
    return {
      configured: false,
      error:
        "WHATSAPP_ACCESS_TOKEN is not set. Set it in your environment to enable WhatsApp notifications.",
    };
  }
  if (!phoneNumberId) {
    return {
      configured: false,
      error:
        "WHATSAPP_PHONE_NUMBER_ID is not set. Set it in your environment to enable WhatsApp notifications.",
    };
  }

  const templateName =
    process.env.WHATSAPP_TEMPLATE_NAME?.trim() || "new_newsletter";

  return {
    configured: true,
    config: {
      accessToken,
      phoneNumberId,
      templateName,
    },
  };
}

/** True if required WhatsApp env vars are set (for feature flags / admin UI). */
export function isWhatsAppConfigured(): boolean {
  const result = getWhatsAppConfig();
  return result.configured;
}
