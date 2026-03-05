# WhatsApp Provider Integration (Day 2)

## Structure

```
lib/whatsapp/
  config.ts         # Env: WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_TEMPLATE_NAME; getBaseUrl() for APP_URL
  send.ts           # sendWhatsAppTemplate(to, templateName, templateParams) → { messageId } | { error }
  newsletter.ts     # buildNewsletterUrl(id), buildNewsletterTemplateParams(subject, id)
  index.ts          # Public API
  providers/
    meta-cloud.ts   # Meta WhatsApp Cloud API (v18); Twilio can be added alongside
```

## Environment

- **WHATSAPP_ACCESS_TOKEN** – Required. Bearer token from Meta.
- **WHATSAPP_PHONE_NUMBER_ID** – Required. Phone number ID (numeric) from Meta.
- **WHATSAPP_TEMPLATE_NAME** – Optional. Default `new_newsletter`. Must match an approved template in Meta Business Manager.
- **APP_URL** / **NEXT_PUBLIC_APP_URL** – Used by `getBaseUrl()` for newsletter links; same as rest of app.

## Usage

```ts
import {
  sendWhatsAppTemplate,
  buildNewsletterTemplateParams,
  getWhatsAppConfig,
} from "@/lib/whatsapp";

// Check before sending (e.g. in API route)
const config = getWhatsAppConfig();
if (!config.configured) {
  return NextResponse.json({ error: config.error }, { status: 503 });
}

const params = buildNewsletterTemplateParams("Weekly Update", "newsletter-uuid");
const result = await sendWhatsAppTemplate("+15551234567", "new_newsletter", params);

if ("messageId" in result) {
  console.log("Sent:", result.messageId);
} else {
  console.error("Failed:", result.error);
}
```

## Extensibility

- **Multiple providers:** Add `providers/twilio.ts` (or similar) with the same `SendTemplateResponse` contract. In `send.ts`, read an env var (e.g. `WHATSAPP_PROVIDER=meta|twilio`) and call the appropriate provider. Config can be split per provider in env.
- **No throws:** All public functions return result objects; callers handle `error` and log as needed.
- **Newsletter mapping:** Template param order (subject, link) is defined in `buildNewsletterTemplateParams`; the template in Meta must use the same order (e.g. body: "New: {{1}}. Read: {{2}}").
- **Base URL:** Centralized in `getBaseUrl()` so newsletter and unsubscribe links stay consistent.
