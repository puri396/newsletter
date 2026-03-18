import type OpenAI from "openai";
import { getGeminiClient } from "./gemini-client";
import { getOpenAIClient } from "./client";

interface GenerateVideoContentInput {
  description: string;
  tone: string;
  targetAudience: string;
  referenceLinks?: string[];
}

interface GenerateVideoContentOutput {
  title: string;
  description: string;
  videoScript: string;
  keyPoints: string[];
  thumbnailPrompt?: string;
}

function buildVideoSystemPrompt(): string {
  return (
    "You are an expert video content strategist and script writer. You design concise, high-retention short-form or explainer video scripts in JSON only.\n\n" +
    'You must respond with a single valid JSON object (no markdown, no code fence) with these keys:\n' +
    '- \"title\": string, concise video title optimized for click-through\n' +
    '- \"description\": string, 1-3 sentence description of the video content\n' +
    '- \"videoScript\": string, full script including scene directions and spoken lines (label speakers and scenes clearly)\n' +
    '- \"keyPoints\": array of 3-7 bullet-style key ideas covered in the video\n' +
    '- \"thumbnailPrompt\": string, short prompt describing the ideal thumbnail visual\n\n' +
    "Do not include URLs. Focus on strong hooks, clear structure, and a compelling call to action where appropriate."
  );
}

function buildVideoUserPrompt(input: GenerateVideoContentInput): string {
  const parts: string[] = [
    `Video goal or topic: ${input.description.trim()}`,
    `Tone: ${input.tone.trim()}`,
    `Target audience: ${input.targetAudience.trim()}`,
  ];
  if (Array.isArray(input.referenceLinks) && input.referenceLinks.length > 0) {
    const links = input.referenceLinks
      .map((l) => (typeof l === "string" ? l.trim() : ""))
      .filter(Boolean);
    if (links.length > 0) {
      parts.push(
        `Reference links (for background only, do not paste URLs in script):\n${links.join(
          "\n",
        )}`,
      );
    }
  }
  parts.push("\nGenerate the response as JSON.");
  return parts.join("\n\n");
}

function stripJsonFence(text: string): string {
  const trimmed = text.trim();
  const jsonBlock = /^```(?:json)?\s*([\s\S]*?)```$/;
  const match = trimmed.match(jsonBlock);
  return match ? match[1].trim() : trimmed;
}

function parseVideoResponse(text: string): GenerateVideoContentOutput {
  const raw = JSON.parse(stripJsonFence(text)) as Record<string, unknown>;
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid video content response: not an object");
  }

  const getString = (obj: Record<string, unknown>, key: string): string => {
    const value = obj[key];
    return typeof value === "string" ? value.trim() : "";
  };

  const title =
    getString(raw, "title") ||
    getString(raw, "Title") ||
    getString(raw, "headline") ||
    "Video post";

  const description =
    getString(raw, "description") ||
    getString(raw, "Description") ||
    getString(raw, "summary") ||
    "";

  const videoScript =
    getString(raw, "videoScript") ||
    getString(raw, "script") ||
    getString(raw, "body") ||
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

  const thumbnailPrompt =
    getString(raw, "thumbnailPrompt") ||
    getString(raw, "thumbnail_prompt") ||
    getString(raw, "thumbnailDescription") ||
    undefined;

  return {
    title,
    description,
    videoScript,
    keyPoints,
    thumbnailPrompt,
  };
}

const VIDEO_OPENAI_MODEL = "gpt-4o-mini";

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

async function generateVideoContentWithOpenAI(
  input: GenerateVideoContentInput,
  client: OpenAI,
): Promise<GenerateVideoContentOutput> {
  const response = await client.chat.completions.create({
    model: VIDEO_OPENAI_MODEL,
    messages: [
      { role: "system", content: buildVideoSystemPrompt() },
      { role: "user", content: buildVideoUserPrompt(input) },
    ],
    response_format: { type: "json_object" },
    temperature: 0.8,
  });

  const choice = response.choices?.[0];
  const content = choice?.message?.content?.trim();
  if (!content) {
    throw new Error("AI returned an empty or invalid video content response.");
  }

  return parseVideoResponse(content);
}

async function generateVideoContentWithGemini(
  input: GenerateVideoContentInput,
): Promise<GenerateVideoContentOutput> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash",
    contents: buildVideoUserPrompt(input),
    systemInstruction: buildVideoSystemPrompt(),
    config: {
      temperature: 0.8,
    },
  });

  const content = getTextFromGeminiResponse(response);
  if (!content) {
    throw new Error("Gemini returned an empty or invalid video content response.");
  }

  return parseVideoResponse(content);
}

export async function generateVideoContent(
  input: GenerateVideoContentInput,
  clientOverride?: OpenAI,
): Promise<GenerateVideoContentOutput> {
  // #region agent log
  void fetch(
    "http://127.0.0.1:7242/ingest/65a4a47d-5807-4059-a768-a0af34f387fe",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: `log_${Date.now()}_H5`,
        runId: "pre-fix",
        hypothesisId: "H5",
        location:
          "src/lib/ai/generate-video-content.ts:generateVideoContent:entry",
        message: "generateVideoContent called",
        data: {
          hasClientOverride: !!clientOverride,
          hasGeminiClient: !!getGeminiClient(),
        },
        timestamp: Date.now(),
      }),
    },
  ).catch(() => {});
  // #endregion agent log

  if (clientOverride) {
    return generateVideoContentWithOpenAI(input, clientOverride);
  }

  const gemini = getGeminiClient();
  if (gemini) {
    try {
      return await generateVideoContentWithGemini(input);
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
                id: `log_${Date.now()}_H8`,
                runId: "pre-fix",
                hypothesisId: "H8",
                location:
                  "src/lib/ai/generate-video-content.ts:quota-fallback",
                message:
                  "Gemini quota error detected, falling back to OpenAI for video content",
                data: { snippet: message.slice(0, 200) },
                timestamp: Date.now(),
              }),
            },
          ).catch(() => {});
          // #endregion agent log

          const client = getOpenAIClient();
          return generateVideoContentWithOpenAI(input, client);
        }
      }
      throw err;
    }
  }

  return generateVideoContentWithOpenAI(input, getOpenAIClient());
}

