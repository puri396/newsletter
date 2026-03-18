import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { errorResponse, ERROR_CODES } from "@/lib/api/error-response";
import { log } from "@/lib/logger";
import {
  generateNewsletterDraft,
  generateBlogDraft,
  generateImageContent,
  generateVideoContent,
  getOpenAIClient,
} from "@/lib/ai";
import { selectAiProvider } from "@/lib/ai/select-provider";

const contentTypeEnum = z.enum(["newsletter", "blog", "image", "video"]);
const statusEnum = z.enum(["draft", "scheduled", "published"]);
const toneEnum = z
  .string()
  .min(1)
  .default("friendly");

const BodySchema = z.object({
  type: contentTypeEnum,
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  tone: toneEnum.optional(),
  aiProvider: z
    .enum(["openai", "gemini", "claude", "leonardo", "lightx"])
    .optional(),
  aiModel: z.string().optional(),
  referenceLinks: z.array(z.string()).optional().default([]),
  mediaReferenceLinks: z.array(z.string()).optional().default([]),
  status: statusEnum.optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const raw = await request.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      const first = parsed.error.flatten().formErrors[0];
      const message = typeof first === "string" ? first : "Invalid input.";
      return errorResponse(ERROR_CODES.VALIDATION_ERROR, message, 400);
    }

    const existing = await prisma.newsletter.findUnique({
      where: { id },
    });

    if (!existing) {
      return errorResponse(
        ERROR_CODES.NOT_FOUND,
        "EPIC content not found.",
        404,
      );
    }

    const {
      type,
      title,
      description,
      tone,
      aiProvider,
      aiModel,
      referenceLinks,
      mediaReferenceLinks,
      status,
    } = parsed.data;

    const safeTone = tone || "friendly";
    const targetAudience = "General audience";
    const llmProvider =
      aiProvider === "leonardo" || aiProvider === "lightx"
        ? undefined
        : aiProvider;
    const selectedProvider = selectAiProvider(llmProvider);
    const preferOpenAI = selectedProvider === "openai";
    const openAIClient = preferOpenAI ? getOpenAIClient() : undefined;
    const statusToUse = status ?? existing.status;

    const existingMeta =
      (existing.epicMetadata as Record<string, unknown> | null) ?? {};

    if (type === "newsletter") {
      const draft = await generateNewsletterDraft(
        {
          topic: description?.trim() || title.trim(),
          tone: safeTone,
          targetAudience,
          title: title.trim(),
          referenceLinks:
            referenceLinks.length > 0 ? referenceLinks : undefined,
          imageReferenceLinks:
            mediaReferenceLinks.length > 0 ? mediaReferenceLinks : undefined,
          videoReferenceLinks: [],
        },
        openAIClient,
      );

      const epicMetadata = {
        ...existingMeta,
        tone: safeTone,
        aiProvider,
        referenceLinks,
        mediaReferenceLinks,
        keyPoints: draft.keyPoints,
      };

      const imagePromptsToSave =
        draft.imagePrompts ?? (existing.imagePrompts ?? undefined);
      const videoScriptToSave =
        draft.videoPrompts && draft.videoPrompts.length > 0
          ? { prompts: draft.videoPrompts }
          : (existing.videoScript ?? undefined);

      const updated = await prisma.newsletter.update({
        where: { id },
        data: {
          subject: draft.title.trim() || title.trim(),
          shortTitle: (draft.title || title).trim().slice(0, 100),
          description:
            draft.description?.trim() || description?.trim() || null,
          body: draft.body?.trim() || description?.trim() || "",
          status: statusToUse,
          aiModel: aiModel ?? existing.aiModel,
          imagePrompts: imagePromptsToSave,
          videoScript: videoScriptToSave,
          epicMetadata,
        },
      });

      return NextResponse.json({ data: updated }, { status: 200 });
    }

    if (type === "blog") {
      const draft = await generateBlogDraft(
        {
          topic: description?.trim() || title.trim(),
          tone: safeTone,
          targetAudience,
          title: title.trim(),
          referenceLinks:
            referenceLinks.length > 0 ? referenceLinks : undefined,
        },
        openAIClient,
      );

      const epicMetadata = {
        ...existingMeta,
        tone: safeTone,
        aiProvider,
        referenceLinks,
        keyPoints: draft.keyPoints,
      };

      const updated = await prisma.newsletter.update({
        where: { id },
        data: {
          // keep existing.contentType as-is to avoid enum mismatches
          subject: draft.title.trim() || title.trim(),
          shortTitle: (draft.title || title).trim().slice(0, 100),
          description:
            draft.description?.trim() || description?.trim() || null,
          body: draft.body?.trim() || "",
          status: statusToUse,
          tags: draft.tags ?? existing.tags,
          aiModel: aiModel ?? existing.aiModel,
          epicMetadata,
        },
      });

      return NextResponse.json({ data: updated }, { status: 200 });
    }

    if (type === "image") {
      const draft = await generateImageContent(
        {
          description: description?.trim() || title.trim(),
          tone: safeTone,
          targetAudience,
          referenceLinks:
            mediaReferenceLinks.length > 0
              ? mediaReferenceLinks
              : referenceLinks.length > 0
                ? referenceLinks
                : undefined,
        },
        openAIClient,
      );

      // #region agent log
      fetch("http://127.0.0.1:7242/ingest/65a4a47d-5807-4059-a768-a0af34f387fe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: "regenerate/route.ts:type=image:afterGenerateImageContent",
          message: "generateImageContent result for EPIC regenerate",
          data: {
            hasBanner: Boolean(draft.bannerImageUrl),
            bannerLen: draft.bannerImageUrl ? draft.bannerImageUrl.length : null,
            imageErrorSnippet: draft.imageError ? draft.imageError.slice(0, 160) : null,
          },
          timestamp: Date.now(),
          runId: "img-debug",
          hypothesisId: "H6",
        }),
      }).catch(() => {});
      // #endregion agent log

      const epicMetadata = {
        ...existingMeta,
        tone: safeTone,
        aiProvider,
        referenceLinks,
        mediaReferenceLinks,
        imagePrompts: draft.imagePrompts,
        hashtags: draft.hashtags,
        imageError: draft.imageError ?? undefined,
      };

      const updated = await prisma.newsletter.update({
        where: { id },
        data: {
          subject: draft.title.trim() || title.trim(),
          shortTitle: (draft.title || title).trim().slice(0, 100),
          description:
            draft.description?.trim() || description?.trim() || null,
          body: draft.caption?.trim() || "",
          bannerImageUrl: draft.bannerImageUrl ?? null,
          status: statusToUse,
          aiModel: aiModel ?? existing.aiModel,
          epicMetadata,
        },
      });

      // #region agent log
      fetch("http://127.0.0.1:7242/ingest/65a4a47d-5807-4059-a768-a0af34f387fe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: "regenerate/route.ts:type=image:afterPrismaUpdate",
          message: "EPIC image regenerate saved to DB",
          data: {
            savedHasBanner: Boolean((updated as { bannerImageUrl?: unknown }).bannerImageUrl),
            savedBannerLen:
              typeof (updated as { bannerImageUrl?: unknown }).bannerImageUrl === "string"
                ? ((updated as { bannerImageUrl: string }).bannerImageUrl.length as number)
                : null,
          },
          timestamp: Date.now(),
          runId: "img-debug",
          hypothesisId: "H6",
        }),
      }).catch(() => {});
      // #endregion agent log

      return NextResponse.json({ data: updated }, { status: 200 });
    }

    if (type === "video") {
      const draft = await generateVideoContent(
        {
          description: description?.trim() || title.trim(),
          tone: safeTone,
          targetAudience,
          referenceLinks:
            mediaReferenceLinks.length > 0
              ? mediaReferenceLinks
              : referenceLinks.length > 0
                ? referenceLinks
                : undefined,
        },
        openAIClient,
      );

      const epicMetadata = {
        ...existingMeta,
        tone: safeTone,
        aiProvider,
        referenceLinks,
        mediaReferenceLinks,
        keyPoints: draft.keyPoints,
        thumbnailPrompt: draft.thumbnailPrompt,
      };

      const videoScriptToSave =
        draft.videoScript && draft.videoScript.length > 0
          ? { script: draft.videoScript }
          : (existing.videoScript ?? undefined);

      const updated = await prisma.newsletter.update({
        where: { id },
        data: {
          subject: draft.title.trim() || title.trim(),
          shortTitle: (draft.title || title).trim().slice(0, 100),
          description:
            draft.description?.trim() || description?.trim() || null,
          body: draft.videoScript?.trim() || "",
          status: statusToUse,
          aiModel: aiModel ?? existing.aiModel,
          videoScript: videoScriptToSave,
          epicMetadata,
        },
      });

      return NextResponse.json({ data: updated }, { status: 200 });
    }

    return errorResponse(
      ERROR_CODES.VALIDATION_ERROR,
      "Unsupported content type.",
      400,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("error", "Failed to regenerate EPIC content", {
      context: "api/epic/content/[id]/regenerate POST",
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

    if (
      message.includes("429") ||
      message.includes("quota") ||
      message.includes("RESOURCE_EXHAUSTED") ||
      message.includes("GEMINI_QUOTA_EXCEEDED")
    ) {
      return errorResponse(
        ERROR_CODES.AI_RATE_LIMIT,
        "Too many requests or quota exceeded. Wait a bit and try again, or configure an alternate AI provider.",
        429,
      );
    }

    if (message.includes("empty") || message.includes("invalid response")) {
      return errorResponse(
        ERROR_CODES.AI_INVALID_RESPONSE,
        "AI returned an invalid response. Please try again.",
        502,
      );
    }

    return errorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      message || "Failed to regenerate EPIC content. Please try again.",
      500,
    );
  }
}

