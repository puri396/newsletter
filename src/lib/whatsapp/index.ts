/**
 * WhatsApp notification integration.
 * Provider-agnostic send API; currently implemented via Meta Cloud API.
 * Extensibility: add providers (e.g. Twilio) in providers/ and switch by env or config.
 */

export { sendWhatsAppTemplate } from "./send";
export type { SendTemplateResult, SendTemplateSuccess, SendTemplateFailure } from "./send";

export { buildNewsletterUrl, buildNewsletterTemplateParams } from "./newsletter";

export {
  getBaseUrl,
  getWhatsAppConfig,
  isWhatsAppConfigured,
} from "./config";
export type { WhatsAppConfig, WhatsAppConfigResult } from "./config";
