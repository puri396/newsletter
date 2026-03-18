import type OpenAI from "openai";
import { getGeminiClient } from "./gemini-client";
import { getOpenAIClient } from "./client";
import type {
  GenerateNewsletterInput,
  GenerateNewsletterOutput,
} from "./types";

const OPENAI_MODEL = "gpt-4o-mini";
const GEMINI_MODEL_DEFAULT = "gemini-2.0-flash";

function getGeminiModels(): string[] {
  const modelsFromEnv = process.env.GEMINI_MODELS
    ?.split(",")
    .map((m) => m.trim())
    .filter(Boolean);

  if (modelsFromEnv && modelsFromEnv.length > 0) {
    return modelsFromEnv;
  }

  const single = process.env.GEMINI_MODEL?.trim();
  if (single) {
    return [single];
  }

  return [GEMINI_MODEL_DEFAULT];
}

function buildSystemPrompt(hasMediaRefs: boolean): string {
  const base = `You are an expert newsletter writer. You produce clear, engaging newsletter content in JSON only.

You must respond with a single valid JSON object (no markdown, no code fence) with these keys:
- "title": string, catchy newsletter headline
- "description": string, 1-2 sentence summary suitable for email preheader
- "body": string, main newsletter content in plain text with short paragraphs; use line breaks between paragraphs
- "keyPoints": array of strings, 3-5 bullet-style key takeaways
- "imagePrompts": array of 1-3 strings, short prompts for AI image generation (e.g. "Modern illustration of AI tools, blue gradient, minimalist style"). Each prompt should describe a visual suitable for the newsletter. Be specific and visual.
- "videoPrompts": array of 1-2 strings, short descriptions for video content (e.g. "Short explainer video about AI automation"). Used for video suggestions.`;

  const mediaPart = hasMediaRefs
    ? `
- "suggestedImages": array of image URLs from provided reference links (include relevant ones)
- "suggestedVideos": array of video URLs from provided reference links (include relevant ones)`
    : "";

  return (
    base +
    mediaPart +
    `

Keep tone and audience in mind. Body should be readable and scannable. Always include imagePrompts for visual content.`
  );
}

function buildUserPrompt(input: GenerateNewsletterInput): string {
  const parts: string[] = [
    `Topic: ${input.topic.trim()}`,
    `Tone: ${input.tone.trim()}`,
    `Target audience: ${input.targetAudience.trim()}`,
  ];
  if (input.title?.trim()) {
    parts.push(`Suggested title (you may refine): ${input.title.trim()}`);
  }
  if (
    Array.isArray(input.referenceLinks) &&
    input.referenceLinks.length > 0
  ) {
    const links = input.referenceLinks
      .map((l) => (typeof l === "string" ? l.trim() : ""))
      .filter(Boolean);
    if (links.length > 0) {
      parts.push(`Reference links (use for context only, do not paste URLs in body):\n${links.join("\n")}`);
    }
  }
  if (
    Array.isArray(input.imageReferenceLinks) &&
    input.imageReferenceLinks.length > 0
  ) {
    parts.push(
      `Image reference links (for visual content suggestions):\n${input.imageReferenceLinks.join("\n")}`);
  }
  if (
    Array.isArray(input.videoReferenceLinks) &&
    input.videoReferenceLinks.length > 0
  ) {
    parts.push(
      `Video reference links (for video content suggestions):\n${input.videoReferenceLinks.join("\n")}`);
  }
  parts.push("\nGenerate the newsletter draft as JSON.");
  return parts.join("\n\n");
}

/** Strip markdown code fence if present so we can parse JSON. */
function stripJsonFence(text: string): string {
  const trimmed = text.trim();
  const jsonBlock = /^```(?:json)?\s*([\s\S]*?)```$/;
  const match = trimmed.match(jsonBlock);
  return match ? match[1].trim() : trimmed;
}

export function parseAndValidate(text: string): GenerateNewsletterOutput {
  const raw = JSON.parse(stripJsonFence(text)) as Record<string, unknown>;
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid response: not an object");
  }

  const getStringField = (obj: Record<string, unknown>, names: string[]): string => {
    for (const name of names) {
      const value = obj[name];
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
    }
    return "";
  };

  const newsletterNode =
    raw.newsletter && typeof raw.newsletter === "object"
      ? (raw.newsletter as Record<string, unknown>)
      : undefined;

  const title =
    getStringField(raw, [
      "title",
      "Title",
      "headline",
      "Headline",
      "newsletter_title",
      "newsletterTitle",
      "subjectLine",
    ]) ||
    (newsletterNode
      ? getStringField(newsletterNode, [
          "title",
          "Title",
          "headline",
          "Headline",
          "newsletter_title",
          "newsletterTitle",
          "subjectLine",
        ])
      : "");

  const description =
    getStringField(raw, ["description", "Description", "summary", "Summary"]) ||
    (newsletterNode
      ? getStringField(newsletterNode, [
          "description",
          "Description",
          "summary",
          "Summary",
          "greeting",
        ])
      : "") ||
    // Fallback: introduction heading/paragraph if present
    (raw.introduction && typeof raw.introduction === "object"
      ? getStringField(raw.introduction as Record<string, unknown>, [
          "heading",
          "title",
          "summary",
        ])
      : "");

  let body =
    getStringField(raw, ["body", "Body", "content", "Content"]) ||
    (newsletterNode
      ? getStringField(newsletterNode, ["body", "Body", "content", "Content"])
      : "");

  // If body is still empty, try to construct it from sections arrays.
  const sectionsSource =
    (Array.isArray(raw.sections) && (raw.sections as unknown[])) ||
    (newsletterNode && Array.isArray(newsletterNode.sections)
      ? (newsletterNode.sections as unknown[])
      : []);

  if (!body && sectionsSource.length > 0) {
    const sectionTexts = sectionsSource
      .map((s) =>
        typeof s === "string"
          ? s
          : s && typeof s === "object"
            ? getStringField(s as Record<string, unknown>, [
                "content",
                "paragraph",
                "body",
                "text",
              ])
            : "",
      )
      .filter((s) => s && s.trim());

    if (sectionTexts.length > 0) {
      body = sectionTexts.join("\n\n");
    }
  }

  let keyPoints: string[] = [];
  const keyPointsRaw =
    (raw.keyPoints as unknown) ??
    (raw.KeyPoints as unknown) ??
    (raw.key_points as unknown) ??
    (raw.keypoints as unknown);

  if (Array.isArray(keyPointsRaw)) {
    keyPoints = (keyPointsRaw as unknown[])
      .filter((x): x is string => typeof x === "string")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  let suggestedImages: string[] = [];
  const suggestedImagesRaw =
    raw.suggestedImages ?? raw.suggested_images ?? raw.imageSuggestions;
  if (Array.isArray(suggestedImagesRaw)) {
    suggestedImages = (suggestedImagesRaw as unknown[])
      .filter((x): x is string => typeof x === "string")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  let suggestedVideos: string[] = [];
  const suggestedVideosRaw =
    raw.suggestedVideos ?? raw.suggested_videos ?? raw.videoSuggestions;
  if (Array.isArray(suggestedVideosRaw)) {
    suggestedVideos = (suggestedVideosRaw as unknown[])
      .filter((x): x is string => typeof x === "string")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  let imagePrompts: string[] = [];
  const imagePromptsRaw = raw.imagePrompts ?? raw.image_prompts;
  if (Array.isArray(imagePromptsRaw)) {
    imagePrompts = (imagePromptsRaw as unknown[])
      .filter((x): x is string => typeof x === "string")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3);
  }

  let videoPrompts: string[] = [];
  const videoPromptsRaw = raw.videoPrompts ?? raw.video_prompts;
  if (Array.isArray(videoPromptsRaw)) {
    videoPrompts = (videoPromptsRaw as unknown[])
      .filter((x): x is string => typeof x === "string")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 2);
  }

  return {
    title: title || "Untitled",
    description,
    body: body || "",
    keyPoints,
    imagePrompts: imagePrompts.length > 0 ? imagePrompts : undefined,
    videoPrompts: videoPrompts.length > 0 ? videoPrompts : undefined,
    suggestedImages: suggestedImages.length > 0 ? suggestedImages : undefined,
    suggestedVideos: suggestedVideos.length > 0 ? suggestedVideos : undefined,
  };
}

function getTextFromGeminiResponse(response: { text?: string; candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }): string | undefined {
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

async function generateNewsletterDraftWithGemini(
  input: GenerateNewsletterInput,
): Promise<GenerateNewsletterOutput> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  const models = getGeminiModels();
  const quotaErrors: string[] = [];
  const modelErrors: string[] = [];

  for (const model of models) {
    try {
      // #region agent log
      void fetch("http://127.0.0.1:7242/ingest/65a4a47d-5807-4059-a768-a0af34f387fe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: `log_${Date.now()}_H1`,
          runId: "pre-fix",
          hypothesisId: "H1",
          location: "src/lib/ai/generate-newsletter.ts:generateNewsletterDraftWithGemini",
          message: "Calling Gemini generateContent",
          data: { model },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion agent log

      const hasMediaRefs =
        (Array.isArray(input.imageReferenceLinks) &&
          input.imageReferenceLinks.length > 0) ||
        (Array.isArray(input.videoReferenceLinks) &&
          input.videoReferenceLinks.length > 0);

      const response = await ai.models.generateContent({
        model,
        contents: buildUserPrompt(input),
        systemInstruction: buildSystemPrompt(hasMediaRefs),
        config: {
          temperature: 0.7,
        },
      });

      const content = getTextFromGeminiResponse(response);
      if (!content) {
        const feedback = response as { promptFeedback?: { blockReason?: string } };
        const blockReason = feedback.promptFeedback?.blockReason;
        if (blockReason) {
          // Content blocked is model-specific; try next model if available.
          modelErrors.push(`${model}: content blocked (${blockReason})`);
          continue;
        }
        modelErrors.push(`${model}: empty or invalid response`);
        continue;
      }

      // #region agent log
      void fetch("http://127.0.0.1:7242/ingest/65a4a47d-5807-4059-a768-a0af34f387fe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: `log_${Date.now()}_H3`,
          runId: "pre-fix",
          hypothesisId: "H3",
          location: "src/lib/ai/generate-newsletter.ts:generateNewsletterDraftWithGemini",
          message: "Gemini content before parse",
          data: { model, contentPreview: content.slice(0, 500) },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion agent log

      return parseAndValidate(content);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // #region agent log
      void fetch("http://127.0.0.1:7242/ingest/65a4a47d-5807-4059-a768-a0af34f387fe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: `log_${Date.now()}_H2`,
          runId: "pre-fix",
          hypothesisId: "H2",
          location: "src/lib/ai/generate-newsletter.ts:generateNewsletterDraftWithGemini",
          message: "Gemini error in generateNewsletterDraftWithGemini",
          data: { model, message: msg },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion agent log

      if (msg.includes("429") || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
        quotaErrors.push(`${model}: ${msg}`);
        // Try next model, if any.
        continue;
      }

      if (msg.includes("404") || msg.includes("not found") || msg.includes("model")) {
        // Model not found – try next configured model.
        modelErrors.push(`${model}: not found or unsupported`);
        continue;
      }

      if (msg.includes("403") || msg.includes("permission") || msg.includes("API key") || msg.includes("invalid")) {
        throw new Error(`Gemini API key error: ${msg}`);
      }

      // For other unexpected errors, fail fast.
      throw err;
    }
  }

  if (quotaErrors.length > 0) {
    throw new Error(
      `GEMINI_QUOTA_EXCEEDED: All configured Gemini models returned quota errors. Details: ${quotaErrors.join(
        " | ",
      )}`,
    );
  }

  if (modelErrors.length > 0) {
    throw new Error(
      `Gemini models unavailable or returned invalid responses. Details: ${modelErrors.join(" | ")}`,
    );
  }

  throw new Error("No Gemini models are configured or available. Check GEMINI_MODELS / GEMINI_MODEL.");
}

/**
 * Generates a newsletter draft using the configured LLM.
 * Uses Gemini when GEMINI_API_KEY is set, otherwise OpenAI.
 * Handles rate limits and API errors via thrown errors; caller should map to HTTP responses.
 * @param input - Topic, tone, audience, optional reference links.
 * @param clientOverride - Optional OpenAI client (e.g. fallback key when primary is rate limited). When set, forces OpenAI.
 */
export async function generateNewsletterDraft(
  input: GenerateNewsletterInput,
  clientOverride?: OpenAI,
): Promise<GenerateNewsletterOutput> {
  if (clientOverride) {
    return generateNewsletterDraftWithOpenAI(input, clientOverride);
  }

  const gemini = getGeminiClient();
  if (gemini) {
    try {
      return await generateNewsletterDraftWithGemini(input);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);

      if (message.includes("GEMINI_QUOTA_EXCEEDED")) {
        // #region agent log
        void fetch("http://127.0.0.1:7242/ingest/65a4a47d-5807-4059-a768-a0af34f387fe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: `log_${Date.now()}_H_QUOTA_FALLBACK`,
            runId: "post-fix",
            hypothesisId: "H_QUOTA_FALLBACK",
            location: "src/lib/ai/generate-newsletter.ts:generateNewsletterDraft",
            message: "Gemini quota exceeded, attempting OpenAI fallback",
            data: {},
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion agent log

        const openaiKey = process.env.OPENAI_API_KEY?.trim();
        if (openaiKey) {
          const client = getOpenAIClient();
          return generateNewsletterDraftWithOpenAI(input, client);
        }
      }

      throw err;
    }
  }

  return generateNewsletterDraftWithOpenAI(input, getOpenAIClient());
}

async function generateNewsletterDraftWithOpenAI(
  input: GenerateNewsletterInput,
  client: OpenAI,
): Promise<GenerateNewsletterOutput> {
  // #region agent log
  void fetch("http://127.0.0.1:7242/ingest/65a4a47d-5807-4059-a768-a0af34f387fe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: `log_${Date.now()}_H4`,
      runId: "pre-fix",
      hypothesisId: "H4",
      location: "src/lib/ai/generate-newsletter.ts:generateNewsletterDraftWithOpenAI",
      message: "Calling OpenAI chat.completions.create",
      data: { model: OPENAI_MODEL },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion agent log

  const hasMediaRefs =
    (Array.isArray(input.imageReferenceLinks) &&
      input.imageReferenceLinks.length > 0) ||
    (Array.isArray(input.videoReferenceLinks) &&
      input.videoReferenceLinks.length > 0);

  const response = await client.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: "system", content: buildSystemPrompt(hasMediaRefs) },
      { role: "user", content: buildUserPrompt(input) },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const choice = response.choices?.[0];
  const content = choice?.message?.content?.trim();

  if (!content) {
    throw new Error("AI returned an empty or invalid response.");
  }

  // #region agent log
  void fetch("http://127.0.0.1:7242/ingest/65a4a47d-5807-4059-a768-a0af34f387fe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: `log_${Date.now()}_H5`,
      runId: "pre-fix",
      hypothesisId: "H5",
      location: "src/lib/ai/generate-newsletter.ts:generateNewsletterDraftWithOpenAI",
      message: "OpenAI content before parse",
      data: { contentPreview: content.slice(0, 500) },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion agent log

  return parseAndValidate(content);
}
