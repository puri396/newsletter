import type OpenAI from "openai";
import { getOpenAIClient } from "./client";
import type {
  ImagePromptsInput,
  ImagePromptsOutput,
} from "./image-prompts-types";

const MODEL = "gpt-4o-mini";

const MAX_BODY_LENGTH = 8_000;

function buildSystemPrompt(): string {
  return `You are an expert at creating visual, cinematic image prompts for thumbnails and covers. You produce only valid JSON.

Respond with a single JSON object (no markdown, no code fence) with exactly one key:
- "imagePrompts": array of 2–3 strings

Each string is a short image prompt (1–2 sentences) describing a thumbnail or cover image. Focus on:
- Composition (framing, angle, subject placement)
- Subject (what is shown)
- Mood and lighting (e.g. dramatic, warm, minimal, high contrast)
- Style suitable for YouTube Shorts / Instagram Reels thumbnails (eye-catching, readable at small size)

Do NOT generate actual images. Output text prompts only. Be specific and visual.`;
}

function buildUserPrompt(input: ImagePromptsInput): string {
  const body =
    input.newsletterBody.length > MAX_BODY_LENGTH
      ? input.newsletterBody.slice(0, MAX_BODY_LENGTH) + "\n\n[Content truncated.]"
      : input.newsletterBody.trim();

  return `Generate 2–3 thumbnail/cover image prompt ideas based on this newsletter content. Return only the JSON object with "imagePrompts" array.\n\n---\n\n${body}`;
}

function ensureStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return (value as unknown[])
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseAndValidate(text: string): ImagePromptsOutput {
  const raw = JSON.parse(text) as Record<string, unknown>;
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid response: not an object");
  }
  const imagePrompts = ensureStringArray(raw.imagePrompts);
  return { imagePrompts };
}

/**
 * Generates 2–3 thumbnail/cover image prompt ideas from newsletter body.
 * Caller should map thrown errors to HTTP responses (503, 429, 502, 500).
 * @param clientOverride - Optional OpenAI client (e.g. fallback key when primary is rate limited).
 */
export async function generateImagePrompts(
  input: ImagePromptsInput,
  clientOverride?: OpenAI,
): Promise<ImagePromptsOutput> {
  const client = clientOverride ?? getOpenAIClient();

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: buildUserPrompt(input) },
    ],
    response_format: { type: "json_object" },
    temperature: 0.6,
  });

  const choice = response.choices?.[0];
  const content = choice?.message?.content?.trim();

  if (!content) {
    throw new Error("AI returned an empty or invalid response.");
  }

  return parseAndValidate(content);
}
