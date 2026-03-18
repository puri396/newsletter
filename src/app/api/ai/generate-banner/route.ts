import { NextResponse } from "next/server";
import { z } from "zod";
import { generateBannerImage } from "@/lib/ai-image";
import { errorResponse, ERROR_CODES } from "@/lib/api/error-response";
import { log } from "@/lib/logger";
import { prisma } from "@/lib/db";

const APP_URL =
  process.env.APP_URL?.replace(/\/$/, "") ??
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  "";

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
          "AI image service is not configured. Please set HUGGINGFACE_API_KEY.",
          503,
        );
      }
      if (result.error.includes("Too many requests")) {
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

    // Auto-upload the data: URL to the media library so it can be used in emails.
    // The raw data: URL is stripped by email clients (Resend) so we need a
    // permanent /api/media/[id] URL instead.
    let finalUrl: string = result.url;
    try {
      if (result.url.startsWith("data:")) {
        const match = result.url.match(/^data:(image\/[^;]+);base64,(.+)$/);
        if (match) {
          const [, mimeType, base64] = match;
          const size = Math.round((base64.length * 3) / 4);
          const media = await prisma.media.create({
            data: {
              name: `ai-banner-${Date.now()}.png`,
              mimeType: mimeType ?? "image/png",
              size,
              dataUrl: result.url,
            },
          });
          finalUrl = `${APP_URL}/api/media/${media.id}`;
        }
      }
    } catch (uploadErr) {
      // Non-fatal: return original data: URL if upload fails
      log("error", "Failed to persist AI-generated banner to media", {
        route: "api/ai/generate-banner",
        errorMessage: uploadErr instanceof Error ? uploadErr.message : String(uploadErr),
      });
    }

    return NextResponse.json({ url: finalUrl }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("error", "AI generate-banner failed", {
      route: "api/ai/generate-banner",
      errorMessage: message,
    });

    if (message.includes("HUGGINGFACE_API_KEY")) {
      return errorResponse(
        ERROR_CODES.AI_SERVICE_UNAVAILABLE,
        "AI image service is not configured. Please set HUGGINGFACE_API_KEY.",
        503,
      );
    }

    return errorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      "Failed to generate banner image. Please try again.",
      502,
    );
  }
}
