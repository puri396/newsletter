import { NextResponse } from "next/server";
import { RateLimitError } from "openai";
import { z } from "zod";
import { generateImagePrompts, getOpenAIClientFallback } from "@/lib/ai";
import { errorResponse, ERROR_CODES } from "@/lib/api/error-response";
import { log } from "@/lib/logger";

const BodySchema = z.object({
  newsletterBody: z
    .string()
    .min(1, "newsletterBody is required and must be a non-empty string"),
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
    const { newsletterBody } = parsed.data;

    const result = await generateImagePrompts({ newsletterBody });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("error", "AI image-prompts failed", {
      route: "api/ai/image-prompts",
      errorMessage: message,
    });

    if (message.includes("OPENAI_API_KEY")) {
      return errorResponse(
        ERROR_CODES.AI_SERVICE_UNAVAILABLE,
        "AI service is not configured. Please set OPENAI_API_KEY.",
        503,
      );
    }

    if (error instanceof RateLimitError) {
      const fallbackClient = getOpenAIClientFallback();
      if (fallbackClient) {
        try {
          const result = await generateImagePrompts(
            { newsletterBody },
            fallbackClient,
          );
          return NextResponse.json(result, { status: 200 });
        } catch (fallbackError) {
          const fallbackMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
          log("error", "AI image-prompts fallback key also failed", {
            route: "api/ai/image-prompts",
            errorMessage: fallbackMessage,
          });
        }
      }
      return errorResponse(
        ERROR_CODES.AI_RATE_LIMIT,
        "Too many requests. Please try again in a moment.",
        429,
      );
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
      "Failed to generate image prompts. Please try again.",
      500,
    );
  }
}
