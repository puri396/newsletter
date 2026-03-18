import {
  generateNewsletterDraft,
  generateBlogDraft,
  generateImageContent,
  generateVideoContent,
  getOpenAIClient,
} from "@/lib/ai";
import { selectAiProvider } from "@/lib/ai/select-provider";
import type { ExistingPost } from "@/lib/ai/internal-links";

type ContentType = "newsletter" | "blog" | "image" | "video";

interface GenerateEpicInput {
  type: ContentType;
  title: string;
  description?: string;
  tone: string;
  aiProvider?: "openai" | "gemini" | "claude";
  aiModel?: string;
  referenceLinks: string[];
  mediaReferenceLinks: string[];
  /** Published blog posts to auto-link within generated blog bodies */
  existingPosts?: ExistingPost[];
}

interface EpicDraftResult {
  prismaData: Record<string, unknown>;
}

export async function generateEpicDraft(
  input: GenerateEpicInput,
): Promise<EpicDraftResult> {
  const { type, title, description, tone, aiProvider, aiModel } = input;
  const referenceLinks = input.referenceLinks ?? [];
  const mediaReferenceLinks = input.mediaReferenceLinks ?? [];

  const safeTone = tone || "friendly";
  const targetAudience = "General audience";
  const selectedProvider = selectAiProvider(aiProvider);
  const preferOpenAI = selectedProvider === "openai";
  const openAIClient = preferOpenAI ? getOpenAIClient() : undefined;

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

    return {
      prismaData: {
        contentType: "newsletter",
        subject: draft.title.trim() || title.trim(),
        shortTitle: (draft.title || title).trim().slice(0, 100),
        description:
          draft.description?.trim() || description?.trim() || null,
        body: draft.body?.trim() || description?.trim() || "",
        tags: [],
        aiModel: aiModel || null,
        imagePrompts: draft.imagePrompts ?? null,
        videoScript: draft.videoPrompts
          ? { prompts: draft.videoPrompts }
          : null,
        epicMetadata: {
          tone: safeTone,
          aiProvider,
          referenceLinks,
          mediaReferenceLinks,
          keyPoints: draft.keyPoints,
        },
      },
    };
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
        existingPosts: input.existingPosts ?? [],
      },
      openAIClient,
    );

    return {
      prismaData: {
        contentType: "blog",
        subject: draft.title.trim() || title.trim(),
        shortTitle: (draft.title || title).trim().slice(0, 100),
        description:
          draft.description?.trim() || description?.trim() || null,
        body: draft.body?.trim() || "",
        tags: draft.tags ?? [],
        aiModel: aiModel || null,
        epicMetadata: {
          tone: safeTone,
          aiProvider,
          referenceLinks,
          keyPoints: draft.keyPoints,
        },
      },
    };
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

    return {
      prismaData: {
        contentType: "image",
        subject: draft.title.trim() || title.trim(),
        shortTitle: (draft.title || title).trim().slice(0, 100),
        description:
          draft.description?.trim() || description?.trim() || null,
        body: draft.caption?.trim() || "",
        bannerImageUrl: draft.bannerImageUrl || null,
        tags: [],
        aiModel: aiModel || null,
        epicMetadata: {
          tone: safeTone,
          aiProvider,
          referenceLinks,
          mediaReferenceLinks,
          imagePrompts: draft.imagePrompts,
          hashtags: draft.hashtags,
          imageError: draft.imageError ?? undefined,
        },
      },
    };
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

    return {
      prismaData: {
        contentType: "video",
        subject: draft.title.trim() || title.trim(),
        shortTitle: (draft.title || title).trim().slice(0, 100),
        description:
          draft.description?.trim() || description?.trim() || null,
        body: draft.videoScript?.trim() || "",
        tags: [],
        aiModel: aiModel || null,
        videoScript: draft.videoScript
          ? { script: draft.videoScript }
          : null,
        epicMetadata: {
          tone: safeTone,
          aiProvider,
          referenceLinks,
          mediaReferenceLinks,
          keyPoints: draft.keyPoints,
          thumbnailPrompt: draft.thumbnailPrompt,
        },
      },
    };
  }

  throw new Error(`Unsupported EPIC content type: ${type}`);
}

