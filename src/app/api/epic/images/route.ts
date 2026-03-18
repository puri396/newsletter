import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { errorResponse, ERROR_CODES } from "@/lib/api/error-response";
import { log } from "@/lib/logger";

const statusEnum = z.enum(["draft", "scheduled", "published"]);
const toneEnum = z.enum(["friendly", "professional", "technical"]);
const aiProviderEnum = z.enum(["gemini", "chatgpt", "claude", "leonardo"]);

const CreateImageSchema = z.object({
  imageUrl: z.string().url().optional().nullable(),
  gridImageUrls: z.array(z.string().url()).optional().default([]),
  description: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  hashtags: z.array(z.string()).optional().default([]),
  status: statusEnum.optional().default("draft"),
  tone: toneEnum.optional(),
  aiProvider: aiProviderEnum.optional(),
  aiModel: z.string().optional(),
  socialShare: z.array(z.string()).optional().default([]),
});

export async function POST(request: Request) {
  try {
    const raw = await request.json().catch(() => ({}));
    const parsed = CreateImageSchema.safeParse(raw);
    if (!parsed.success) {
      const first = parsed.error.flatten().formErrors[0];
      const message = typeof first === "string" ? first : "Invalid input.";
      return errorResponse(ERROR_CODES.VALIDATION_ERROR, message, 400);
    }

    const {
      imageUrl,
      gridImageUrls,
      description,
      tags,
      hashtags,
      status,
      tone,
      aiProvider,
      aiModel,
      socialShare,
    } = parsed.data;

    const epicMetadata: Record<string, unknown> = {
      gridImageUrls,
      hashtags,
      tone,
      socialShare,
      aiProvider,
    };

    const title =
      description?.trim().slice(0, 100) || "Image post";
    const created = await prisma.newsletter.create({
      data: {
        contentType: "image",
        subject: title,
        description: description?.trim() || null,
        body: description?.trim() || "",
        bannerImageUrl: imageUrl || null,
        status,
        tags,
        aiModel: aiModel || null,
        epicMetadata,
      },
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("error", "Failed to create image post", {
      context: "api/epic/images POST",
      errorMessage: message,
    });
    return errorResponse(
      ERROR_CODES.DATABASE_ERROR,
      "Failed to create image post.",
      500
    );
  }
}
