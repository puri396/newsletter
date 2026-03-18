import type OpenAI from "openai";
import { getGeminiClient } from "./gemini-client";
import { getOpenAIClient } from "./client";
import { injectInternalLinks, type ExistingPost } from "./internal-links";

interface GenerateBlogInput {
  topic: string;
  tone: string;
  targetAudience: string;
  title?: string;
  referenceLinks?: string[];
  /** Published posts to auto-link within the generated body */
  existingPosts?: ExistingPost[];
}

interface GenerateBlogOutput {
  title: string;
  description: string;
  body: string;
  keyPoints: string[];
  tags?: string[];
}

function buildBlogSystemPrompt(): string {
  return (
    "You are an expert blog writer. You produce clear, engaging blog articles in JSON only.\n\n" +
    'You must respond with a single valid JSON object (no markdown, no code fence) with these keys:\n' +
    '- "title": string, compelling blog post title\n' +
    '- "description": string, 1-2 sentence summary suitable as meta description\n' +
    '- "body": string, full blog article in markdown or plain text with headings and paragraphs\n' +
    '- "keyPoints": array of strings, 3-7 key takeaways\n' +
    '- "tags": array of 3-8 short topical tags (single or two-word phrases)\n\n' +
    "Do not include external URLs in the body. Keep tone and audience in mind."
  );
}

function buildBlogUserPrompt(input: GenerateBlogInput): string {
  const parts: string[] = [
    `Topic: ${input.topic.trim()}`,
    `Tone: ${input.tone.trim()}`,
    `Target audience: ${input.targetAudience.trim()}`,
  ];
  if (input.title?.trim()) {
    parts.push(`Suggested title (you may refine): ${input.title.trim()}`);
  }
  if (Array.isArray(input.referenceLinks) && input.referenceLinks.length > 0) {
    const links = input.referenceLinks
      .map((l) => (typeof l === "string" ? l.trim() : ""))
      .filter(Boolean);
    if (links.length > 0) {
      parts.push(
        `Reference links (use only for background context, do not paste URLs in body):\n${links.join(
          "\n",
        )}`,
      );
    }
  }
  parts.push("\nGenerate the blog article as JSON.");
  return parts.join("\n\n");
}

function stripJsonFence(text: string): string {
  const trimmed = text.trim();
  const jsonBlock = /^```(?:json)?\s*([\s\S]*?)```$/;
  const match = trimmed.match(jsonBlock);
  return match ? match[1].trim() : trimmed;
}

function parseBlogResponse(text: string): GenerateBlogOutput {
  const raw = JSON.parse(stripJsonFence(text)) as Record<string, unknown>;
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid blog response: not an object");
  }

  const getString = (obj: Record<string, unknown>, key: string): string => {
    const value = obj[key];
    return typeof value === "string" ? value.trim() : "";
  };

  const title =
    getString(raw, "title") ||
    getString(raw, "Title") ||
    getString(raw, "headline") ||
    "Untitled blog post";

  const description =
    getString(raw, "description") ||
    getString(raw, "Description") ||
    getString(raw, "summary") ||
    "";

  const body =
    getString(raw, "body") ||
    getString(raw, "Body") ||
    getString(raw, "content") ||
    "";

  let keyPoints: string[] = [];
  const kpRaw =
    (raw.keyPoints as unknown) ??
    (raw.KeyPoints as unknown) ??
    (raw.key_points as unknown);
  if (Array.isArray(kpRaw)) {
    keyPoints = (kpRaw as unknown[])
      .filter((x): x is string => typeof x === "string")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  let tags: string[] | undefined;
  const tagsRaw = raw.tags ?? raw.keywords;
  if (Array.isArray(tagsRaw)) {
    const parsed = (tagsRaw as unknown[])
      .filter((x): x is string => typeof x === "string")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parsed.length > 0) {
      tags = parsed.slice(0, 10);
    }
  }

  return {
    title,
    description,
    body,
    keyPoints,
    tags,
  };
}

const BLOG_OPENAI_MODEL = "gpt-4o-mini";

async function generateBlogWithOpenAI(
  input: GenerateBlogInput,
  client: OpenAI,
): Promise<GenerateBlogOutput> {
  const response = await client.chat.completions.create({
    model: BLOG_OPENAI_MODEL,
    messages: [
      { role: "system", content: buildBlogSystemPrompt() },
      { role: "user", content: buildBlogUserPrompt(input) },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const choice = response.choices?.[0];
  const content = choice?.message?.content?.trim();
  if (!content) {
    throw new Error("AI returned an empty or invalid blog response.");
  }
  return parseBlogResponse(content);
}

function getTextFromGeminiResponse(response: {
  text?: string;
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
}): string | undefined {
  const direct = response.text?.trim();
  if (direct) return direct;
  const first = response.candidates?.[0];
  const parts = first?.content?.parts;
  if (Array.isArray(parts)) {
    const text = parts.map((p) => p?.text).filter(Boolean).join("");
    if (text) return text.trim();
  }
  return undefined;
}

async function generateBlogWithGemini(
  input: GenerateBlogInput,
): Promise<GenerateBlogOutput> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash",
    contents: buildBlogUserPrompt(input),
    systemInstruction: buildBlogSystemPrompt(),
    config: {
      temperature: 0.7,
    },
  });

  const content = getTextFromGeminiResponse(response);
  if (!content) {
    throw new Error("Gemini returned an empty or invalid blog response.");
  }

  return parseBlogResponse(content);
}

export async function generateBlogDraft(
  input: GenerateBlogInput,
  clientOverride?: OpenAI,
): Promise<GenerateBlogOutput> {
  // #region agent log
  void fetch(
    "http://127.0.0.1:7242/ingest/65a4a47d-5807-4059-a768-a0af34f387fe",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: `log_${Date.now()}_H3`,
        runId: "pre-fix",
        hypothesisId: "H3",
        location: "src/lib/ai/generate-blog.ts:generateBlogDraft:entry",
        message: "generateBlogDraft called",
        data: {
          hasClientOverride: !!clientOverride,
          hasGeminiClient: !!getGeminiClient(),
        },
        timestamp: Date.now(),
      }),
    },
  ).catch(() => {});
  // #endregion agent log

  const existingPosts = input.existingPosts ?? [];

  async function withInternalLinks(result: GenerateBlogOutput): Promise<GenerateBlogOutput> {
    if (!existingPosts.length) return result;
    const linkedBody = await injectInternalLinks(result.body, existingPosts);
    return { ...result, body: linkedBody };
  }

  if (clientOverride) {
    return withInternalLinks(await generateBlogWithOpenAI(input, clientOverride));
  }

  const gemini = getGeminiClient();
  if (gemini) {
    try {
      return withInternalLinks(await generateBlogWithGemini(input));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const isQuotaError =
        message.includes("GEMINI_QUOTA_EXCEEDED") ||
        message.includes("RESOURCE_EXHAUSTED") ||
        message.includes("quota") ||
        message.includes('"code":429');

      if (isQuotaError) {
        const openaiKey = process.env.OPENAI_API_KEY?.trim();
        if (openaiKey) {
          // #region agent log
          void fetch(
            "http://127.0.0.1:7242/ingest/65a4a47d-5807-4059-a768-a0af34f387fe",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: `log_${Date.now()}_H6`,
                runId: "pre-fix",
                hypothesisId: "H6",
                location:
                  "src/lib/ai/generate-blog.ts:generateBlogDraft:quota-fallback",
                message:
                  "Gemini quota error detected, falling back to OpenAI for blog",
                data: { snippet: message.slice(0, 200) },
                timestamp: Date.now(),
              }),
            },
          ).catch(() => {});
          // #endregion agent log

          const client = getOpenAIClient();
          return withInternalLinks(await generateBlogWithOpenAI(input, client));
        }
      }
      throw err;
    }
  }

  return withInternalLinks(await generateBlogWithOpenAI(input, getOpenAIClient()));
}

