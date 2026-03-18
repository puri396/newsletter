import { NextResponse } from "next/server";
import { RateLimitError } from "openai";
import { z } from "zod";
import {
  generateNewsletterDraft,
  getOpenAIClientFallback,
  getOpenAIClient,
} from "@/lib/ai";
import { generateBannerImage } from "@/lib/ai-image";
import { errorResponse, ERROR_CODES } from "@/lib/api/error-response";
import { log } from "@/lib/logger";

const BodySchema = z.object({
  topic: z.string().min(1, "topic is required"),
  tone: z.string().min(1, "tone is required"),
  targetAudience: z.string().min(1, "targetAudience is required"),
  title: z.string().optional(),
  referenceLinks: z.array(z.string()).optional().default([]),
  imageReferenceLinks: z.array(z.string()).optional().default([]),
  videoReferenceLinks: z.array(z.string()).optional().default([]),
  aiProvider: z.enum(["openai", "gemini", "claude"]).optional(),
  aiModel: z.string().optional(),
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
    const {
      topic,
      tone,
      targetAudience,
      title,
      referenceLinks,
      imageReferenceLinks,
      videoReferenceLinks,
    } = parsed.data;

    const result = await generateNewsletterDraft({
      topic,
      tone,
      targetAudience,
      title,
      referenceLinks: referenceLinks.length > 0 ? referenceLinks : undefined,
      imageReferenceLinks:
        imageReferenceLinks.length > 0 ? imageReferenceLinks : undefined,
      videoReferenceLinks:
        videoReferenceLinks.length > 0 ? videoReferenceLinks : undefined,
    });

    // Generate AI images from imagePrompts (or fallback to title+description)
    const generatedImages: string[] = [];
    const promptsToUse =
      (result.imagePrompts?.length ?? 0) > 0
        ? result.imagePrompts!
        : [
            `${result.title}. ${result.description || result.body.slice(0, 150)}. Professional newsletter illustration, modern style.`,
          ];

    for (const prompt of promptsToUse.slice(0, 2)) {
      const imgResult = await generateBannerImage(prompt);
      if ("url" in imgResult) {
        generatedImages.push(imgResult.url);
      }
    }

    // Merge: generated images first, then user refs, then AI suggestions
    const suggestedImages = [
      ...generatedImages,
      ...(result.suggestedImages ?? []),
      ...(imageReferenceLinks.length > 0 && !result.suggestedImages?.length
        ? imageReferenceLinks
        : []),
    ].filter(Boolean);

    const suggestedVideos =
      (result.suggestedVideos?.length ?? 0) > 0
        ? result.suggestedVideos
        : videoReferenceLinks.length > 0
          ? videoReferenceLinks
          : undefined;

    return NextResponse.json(
      {
        ...result,
        suggestedImages: suggestedImages.length > 0 ? suggestedImages : undefined,
        suggestedVideos,
        generatedImages:
          generatedImages.length > 0 ? generatedImages : undefined,
      },
      { status: 200 }
    );
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
              {
                topic,
                tone,
                targetAudience,
                title,
                referenceLinks: referenceLinks.length > 0 ? referenceLinks : undefined,
                imageReferenceLinks: imageReferenceLinks?.length ? imageReferenceLinks : undefined,
                videoReferenceLinks: videoReferenceLinks?.length ? videoReferenceLinks : undefined,
              },
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
        ? "You've reached the Gemini free tier limit for this model. Wait a bit and try again, or configure OPENAI_API_KEY in .env to use OpenAI as a fallback."
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
