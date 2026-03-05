/**
 * Meta WhatsApp Cloud API provider.
 * Sends template messages via Graph API. Extensibility: other providers (e.g. Twilio) can implement the same send contract in separate files.
 */

const META_GRAPH_BASE = "https://graph.facebook.com/v18.0";

export interface SendTemplateResult {
  success: true;
  messageId: string;
}

export interface SendTemplateError {
  success: false;
  error: string;
}

export type SendTemplateResponse = SendTemplateResult | SendTemplateError;

interface MetaSendParams {
  accessToken: string;
  phoneNumberId: string;
  to: string;
  templateName: string;
  templateParams: string[];
}

/**
 * Sends a template message via Meta WhatsApp Cloud API.
 * Does not throw; returns structured result.
 */
export async function sendTemplateMeta(
  params: MetaSendParams,
): Promise<SendTemplateResponse> {
  const { accessToken, phoneNumberId, to, templateName, templateParams } =
    params;

  const toNumber = to.replace(/\D/g, "");
  if (!toNumber || toNumber.length < 10) {
    return { success: false, error: "Invalid recipient phone number." };
  }

  const bodyParameters = templateParams.map((text) => ({
    type: "text" as const,
    text,
  }));

  const body = {
    messaging_product: "whatsapp",
    to: toNumber,
    type: "template",
    template: {
      name: templateName,
      language: { code: "en" },
      components: [
        {
          type: "body",
          parameters: bodyParameters,
        },
      ],
    },
  };

  const url = `${META_GRAPH_BASE}/${phoneNumberId}/messages`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = (await res.json()) as {
      messages?: Array<{ id: string }>;
      error?: { message?: string; code?: number; error_data?: { details?: string } };
    };

    if (!res.ok) {
      const message =
        data.error?.message ||
        data.error?.error_data?.details ||
        `HTTP ${res.status}`;
      return { success: false, error: message };
    }

    const messageId = data.messages?.[0]?.id;
    if (!messageId) {
      return {
        success: false,
        error: "Meta API did not return a message ID.",
      };
    }

    return { success: true, messageId };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: message.length > 200 ? "Network or API error." : message,
    };
  }
}
