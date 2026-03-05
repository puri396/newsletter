import { NextResponse } from "next/server";
import { RateLimitError } from "openai";
import { z } from "zod";
import { generateNewsletterDraft, getOpenAIClientFallback } from "@/lib/ai";
import { errorResponse, ERROR_CODES } from "@/lib/api/error-response";
import { log } from "@/lib/logger";

const BodySchema = z.object({
  topic: z.string().min(1, "topic is required and must be a non-empty string"),
  tone: z.string().min(1, "tone is required and must be a non-empty string"),
  targetAudience: z
    .string()
    .min(1, "targetAudience is required and must be a non-empty string"),
  referenceLinks: z.array(z.string()).optional().default([]),
});

export async function POST(request: Request) {
  try {
    const raw = await request.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      const first = parsed.error.flatten().formErrors[0];
      const message = typeof first === "string" ? first : "Invalid input.";
      return errorResponse(ERROR_CODES.VALIDATION_ERROR, message, 400);
    }
    const { topic, tone, targetAudience, referenceLinks } = parsed.data;

    const result = await generateNewsletterDraft({
      topic,
      tone,
      targetAudience,
      referenceLinks: referenceLinks.length > 0 ? referenceLinks : undefined,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("error", "AI generate-newsletter failed", {
      route: "api/ai/generate-newsletter",
      errorMessage: message,
    });

    const isKeyError =
      message.includes("OPENAI_API_KEY") ||
      message.includes("GEMINI_API_KEY") ||
      message.includes("Gemini API key error") ||
      message.includes("Incorrect API key") ||
      message.includes("invalid_api_key") ||
      message.includes("API key not valid") ||
      message.includes("401");
    if (isKeyError) {
      return errorResponse(
        ERROR_CODES.AI_SERVICE_UNAVAILABLE,
        "AI service is not configured or API key is invalid. Set GEMINI_API_KEY (Gemini) or OPENAI_API_KEY (OpenAI) in .env.",
        503,
      );
    }

    const isRateLimitOrQuota =
      error instanceof RateLimitError ||
      message.includes("429") ||
      message.includes("quota") ||
      message.includes("RESOURCE_EXHAUSTED") ||
      message.includes("GEMINI_QUOTA_EXCEEDED");
    if (isRateLimitOrQuota) {
      if (error instanceof RateLimitError) {
        const fallbackClient = getOpenAIClientFallback();
        if (fallbackClient) {
          try {
            const result = await generateNewsletterDraft(
              { topic, tone, targetAudience, referenceLinks: referenceLinks.length > 0 ? referenceLinks : undefined },
              fallbackClient,
            );
            return NextResponse.json(result, { status: 200 });
          } catch (fallbackError) {
            const fallbackMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
            log("error", "AI generate-newsletter fallback key also failed", {
              route: "api/ai/generate-newsletter",
              errorMessage: fallbackMessage,
            });
          }
        }
      }
      const quotaMessage = message.includes("GEMINI_QUOTA_EXCEEDED")
        ? message.replace("GEMINI_QUOTA_EXCEEDED: ", "")
        : "Too many requests or quota exceeded. Wait a minute and try again, or check your plan at https://ai.google.dev/gemini-api/docs/rate-limits";
      return errorResponse(ERROR_CODES.AI_RATE_LIMIT, quotaMessage, 429);
    }

    if (message.includes("empty") || message.includes("invalid")) {
      return errorResponse(
        ERROR_CODES.AI_INVALID_RESPONSE,
        "AI returned an invalid response. Please try again.",
        502,
      );
    }

    return errorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      message || "Failed to generate newsletter draft. Please try again.",
      500,
    );
  }
}
