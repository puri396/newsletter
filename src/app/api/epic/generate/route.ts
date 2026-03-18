import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { errorResponse, ERROR_CODES } from "@/lib/api/error-response";
import { log } from "@/lib/logger";
import { generateEpicDraft } from "@/lib/epic/ai-regenerate";

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
    .enum(["openai", "gemini", "claude", "leonardo", "lightx", "huggingface"])
    .optional(),
  aiModel: z.string().optional(),
  referenceLinks: z.array(z.string()).optional().default([]),
  mediaReferenceLinks: z.array(z.string()).optional().default([]),
  status: statusEnum.optional().default("draft"),
});

export async function POST(request: Request) {
  try {
    const baseUrl =
      process.env.APP_URL ??
      process.env.NEXT_PUBLIC_APP_URL ??
      "http://localhost:3000";

    const raw = await request.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      const first = parsed.error.flatten().formErrors[0];
      const message = typeof first === "string" ? first : "Invalid input.";
      return errorResponse(ERROR_CODES.VALIDATION_ERROR, message, 400);
    }

    const { type, title, description, tone, aiProvider, aiModel } =
      parsed.data;
    const referenceLinks = parsed.data.referenceLinks ?? [];
    const mediaReferenceLinks = parsed.data.mediaReferenceLinks ?? [];
    const requestedStatus = parsed.data.status;

    const llmProvider =
      aiProvider === "leonardo" || aiProvider === "lightx" || aiProvider === "huggingface"
        ? undefined
        : aiProvider;

    // For blog generation, fetch published posts to enable auto internal linking
    let existingPosts: { title: string; slug: string }[] = [];
    if (type === "blog") {
      const published = await prisma.newsletter.findMany({
        where: {
          contentType: "blog",
          status: "published",
          slug: { not: null },
        },
        select: { subject: true, slug: true },
        orderBy: { publishedAt: "desc" },
        take: 30,
      });
      existingPosts = published
        .filter((p) => p.slug)
        .map((p) => ({ title: p.subject, slug: p.slug! }));
    }

    const { prismaData } = await generateEpicDraft({
      type,
      title,
      description,
      tone: tone || "friendly",
      aiProvider: llmProvider,
      aiModel,
      referenceLinks,
      mediaReferenceLinks,
      existingPosts,
    });

    // Always create as "draft" so that publish-now can broadcast emails to
    // subscribers and then mark the record as "published". If we saved it as
    // "published" immediately, publish-now's idempotency guard would skip it.
    // Object.assign avoids a TypeScript spread inference issue with the loosely-
    // typed prismaData return value from generateEpicDraft.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createData = Object.assign({}, prismaData, { contentType: type, status: "draft" }) as any;
    const created = await prisma.newsletter.create({ data: createData });

    if (requestedStatus === "published") {
      void fetch(
        `${baseUrl.replace(/\/$/, "")}/api/newsletters/${created.id}/publish-now`,
        { method: "POST" },
      ).catch((err) => {
        const message = err instanceof Error ? err.message : String(err);
        log("error", "EPIC publish-now trigger failed", {
          context: "api/epic/generate POST",
          newsletterId: created.id,
          errorMessage: message,
        });
      });
    }

    // Return the record reflecting the intended final status so the UI is
    // consistent while publish-now completes asynchronously in the background.
    return NextResponse.json(
      { data: { ...created, status: requestedStatus } },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("error", "Failed to generate EPIC content", {
      context: "api/epic/generate POST",
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
      const hasOpenAIKey = !!process.env.OPENAI_API_KEY?.trim();
      const userMessage = hasOpenAIKey
        ? "Too many requests or quota exceeded. Wait a bit and try again."
        : "Gemini quota exceeded. Add OPENAI_API_KEY to your .env file to use OpenAI as fallback, or wait and try again later.";
      return errorResponse(ERROR_CODES.AI_RATE_LIMIT, userMessage, 429);
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
      message || "Failed to generate EPIC content. Please try again.",
      500,
    );
  }
}
