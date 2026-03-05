import type OpenAI from "openai";
import { getOpenAIClient } from "@/lib/ai/client";
import { getGeminiClient } from "@/lib/ai/gemini-client";

/** DALL-E 3 prompt length limit (conservative). */
const MAX_PROMPT_LENGTH = 4000;

export type GenerateBannerResult =
  | { url: string }
  | { error: string };

/**
 * Generate a single banner image using Gemini (when configured) or
 * OpenAI Images API (DALL-E 3) as a fallback.
 * Returns a URL (may be temporary; production may re-host to persistent storage)
 * or an error object. Does not throw for expected failures (rate limit, invalid prompt, etc.).
 * When Gemini is used, the URL is a data URL (base64-encoded PNG).
 * @param clientOverride - Optional OpenAI client (e.g. fallback key when primary is rate limited).
 */
export async function generateBannerImage(
  prompt: string,
  clientOverride?: OpenAI,
): Promise<GenerateBannerResult> {
  const trimmed = prompt.trim();
  if (!trimmed) {
    return { error: "Prompt is required and cannot be empty." };
  }
  if (trimmed.length > MAX_PROMPT_LENGTH) {
    return {
      error: `Prompt must be ${MAX_PROMPT_LENGTH} characters or fewer.`,
    };
  }

  try {
    /**
     * Prefer Gemini when configured and no explicit OpenAI client override is provided.
     * This matches the text generation behavior (Gemini first, OpenAI fallback).
     */
    if (!clientOverride) {
      const gemini = getGeminiClient();
      if (gemini) {
        const model =
          process.env.GEMINI_IMAGE_MODEL?.trim() || "imagen-3.0-generate-001";

        const response = await gemini.models.generateImages({
          model,
          prompt: trimmed,
          config: {
            numberOfImages: 1,
          },
        });

        const imageBytes =
          response.generatedImages?.[0]?.image?.imageBytes ?? "";

        if (!imageBytes) {
          return {
            error:
              "AI did not return an image. Please try again with a different prompt.",
          };
        }

        // Return a data URL that can be used directly in an <img> tag.
        const url = `data:image/png;base64,${imageBytes}`;
        return { url };
      }
    }

    const client = clientOverride ?? getOpenAIClient();
    const response = await client.images.generate({
      model: "dall-e-3",
      prompt: trimmed,
      n: 1,
      size: "1792x1024",
      response_format: "url",
      quality: "standard",
    });

    const url = response.data?.[0]?.url;
    if (typeof url !== "string" || !url) {
      return { error: "AI did not return an image URL. Please try again." };
    }
    return { url };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (
      message.includes("OPENAI_API_KEY") ||
      message.includes("GEMINI_API_KEY") ||
      message.includes("api_key")
    ) {
      return { error: "AI image service is not configured." };
    }
    if (message.includes("rate") || message.includes("RateLimitError")) {
      return { error: "Too many requests. Please try again in a moment." };
    }
    if (message.includes("content_policy") || message.includes("safety")) {
      return { error: "Image request was rejected. Please try a different prompt." };
    }
    return {
      error: message.length > 200 ? "Image generation failed. Please try again." : message,
    };
  }
}
