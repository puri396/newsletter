import { getOpenAIClient } from "./client";

/**
 * Generates a descriptive alt text for an image using GPT-4o-mini vision.
 * Falls back to a generic description if vision fails.
 *
 * @param imageUrl - Publicly accessible image URL (absolute)
 * @param filename - Original filename used as context hint
 */
export async function generateAltText(
  imageUrl: string,
  filename?: string,
): Promise<string> {
  const openai = getOpenAIClient();

  const contextHint = filename
    ? ` The filename is "${filename}" — use this as a hint for context.`
    : "";

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              `Describe this image in a concise, SEO-friendly alt text (1-2 sentences, max 125 characters). ` +
              `Focus on what is shown: objects, actions, colors, and context that would help someone who cannot see the image understand it.` +
              contextHint +
              ` Return ONLY the alt text string — no quotes, no explanation.`,
          },
          {
            type: "image_url",
            image_url: { url: imageUrl, detail: "low" },
          },
        ],
      },
    ],
    max_tokens: 150,
    temperature: 0.3,
  });

  const text = response.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("AI returned empty alt text response.");

  // Strip surrounding quotes if the model added them
  return text.replace(/^["']|["']$/g, "").trim();
}
