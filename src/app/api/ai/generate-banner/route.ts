import { NextResponse } from "next/server";
import { RateLimitError } from "openai";
import { z } from "zod";
import { getOpenAIClientFallback } from "@/lib/ai";
import { generateBannerImage } from "@/lib/ai-image";
import { errorResponse, ERROR_CODES } from "@/lib/api/error-response";
import { log } from "@/lib/logger";

const BodySchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  newsletterId: z.string().uuid().optional(),
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
    const { prompt } = parsed.data;

    const result = await generateBannerImage(prompt);

    if ("error" in result) {
      if (result.error.includes("not configured")) {
        return errorResponse(
          ERROR_CODES.AI_SERVICE_UNAVAILABLE,
          "AI image service is not configured. Please set GEMINI_API_KEY or OPENAI_API_KEY.",
          503,
        );
      }
      if (result.error.includes("Too many requests")) {
        const fallbackClient = getOpenAIClientFallback();
        if (fallbackClient) {
          const fallbackResult = await generateBannerImage(prompt, fallbackClient);
          if ("url" in fallbackResult) {
            return NextResponse.json({ url: fallbackResult.url }, { status: 200 });
          }
          log("error", "AI generate-banner fallback key also failed", {
            route: "api/ai/generate-banner",
            errorMessage: fallbackResult.error,
          });
        }
        return errorResponse(
          ERROR_CODES.AI_RATE_LIMIT,
          result.error,
          429,
        );
      }
      return errorResponse(
        ERROR_CODES.AI_INVALID_RESPONSE,
        result.error,
        400,
      );
    }

    return NextResponse.json({ url: result.url }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("error", "AI generate-banner failed", {
      route: "api/ai/generate-banner",
      errorMessage: message,
    });

    if (message.includes("OPENAI_API_KEY") || message.includes("GEMINI_API_KEY")) {
      return errorResponse(
        ERROR_CODES.AI_SERVICE_UNAVAILABLE,
        "AI service is not configured. Please set GEMINI_API_KEY or OPENAI_API_KEY.",
        503,
      );
    }

    if (error instanceof RateLimitError) {
      return errorResponse(
        ERROR_CODES.AI_RATE_LIMIT,
        "Too many requests. Please try again in a moment.",
        429,
      );
    }

    return errorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      "Failed to generate banner image. Please try again.",
      502,
    );
  }
}
