import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { errorResponse, ERROR_CODES } from "@/lib/api/error-response";
import { log } from "@/lib/logger";

const toneEnum = z.enum([
  "friendly",
  "professional",
  "technical",
  "marketing",
  "informative",
]);
const aiProviderEnum = z.enum(["gemini", "chatgpt", "claude"]);
const statusEnum = z.enum(["draft", "scheduled", "published"]);

const CreateBlogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  tone: toneEnum.optional(),
  aiProvider: aiProviderEnum.optional(),
  aiModel: z.string().optional(),
  referenceLinks: z.array(z.string()).optional().default([]),
  status: statusEnum.optional().default("draft"),
});

export async function POST(request: Request) {
  try {
    const raw = await request.json().catch(() => ({}));
    const parsed = CreateBlogSchema.safeParse(raw);
    if (!parsed.success) {
      const first = parsed.error.flatten().formErrors[0];
      const message = typeof first === "string" ? first : "Invalid input.";
      return errorResponse(ERROR_CODES.VALIDATION_ERROR, message, 400);
    }

    const { title, description, tone, aiProvider, aiModel, referenceLinks, status } =
      parsed.data;

    const epicMetadata: Record<string, unknown> = {
      tone,
      aiProvider,
      referenceLinks,
    };

    const created = await prisma.newsletter.create({
      data: {
        contentType: "blog",
        subject: title.trim().slice(0, 200),
        shortTitle: title.trim().slice(0, 100),
        description: description?.trim() || null,
        body: description?.trim() || "",
        status,
        tags: [],
        aiModel: aiModel || null,
        epicMetadata,
      },
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("error", "Failed to create blog post", {
      context: "api/epic/blogs POST",
      errorMessage: message,
    });
    return errorResponse(
      ERROR_CODES.DATABASE_ERROR,
      "Failed to create blog post.",
      500,
    );
  }
}
