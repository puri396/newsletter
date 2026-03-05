import type OpenAI from "openai";
import { getOpenAIClient } from "./client";
import type { RepurposeInput, RepurposeOutput } from "./repurpose-types";

const MODEL = "gpt-4o-mini";

const MAX_BODY_LENGTH = 12_000;

function buildSystemPrompt(): string {
  return `You are an expert at repurposing newsletter content for short-form video and social media. You produce only valid JSON.

Respond with a single JSON object (no markdown, no code fence) with exactly these keys:
- "reelScript": string — A 30–60 second spoken script for a vertical reel/video. Concise, punchy, platform-neutral. No fluff or repetition.
- "hooks": array of 3–5 strings — Compelling opening hooks (one per option) that grab attention in the first 3 seconds.
- "ctas": array of 2–3 strings — Clear call-to-action lines to end the video or post.
- "linkedin": string — Professional caption for LinkedIn. Concise, authoritative tone. One short paragraph or 2–3 sentences.
- "twitter": string — Short, punchy caption for X (Twitter). Under 280 characters. Wit or insight preferred.
- "instagram": string — Engaging, slightly emotional or conversational caption for Instagram. Can be 1–2 short paragraphs.
- "hashtags": array of strings — 5–12 relevant, specific hashtags (not generic). Mix of niche and broader. No spam.

Be concise. Avoid repetition across sections. Content must be directly usable without editing.`;
}

function buildUserPrompt(input: RepurposeInput): string {
  const body =
    input.newsletterBody.length > MAX_BODY_LENGTH
      ? input.newsletterBody.slice(0, MAX_BODY_LENGTH) + "\n\n[Content truncated.]"
      : input.newsletterBody.trim();

  return `Repurpose this newsletter content into reel script, hooks, CTAs, and platform captions. Return only the JSON object.\n\n---\n\n${body}`;
}

function ensureString(value: unknown): string {
  if (typeof value === "string") return value.trim();
  return "";
}

function ensureStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return (value as unknown[])
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseAndValidate(text: string): RepurposeOutput {
  const raw = JSON.parse(text) as Record<string, unknown>;
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid response: not an object");
  }

  return {
    reelScript: ensureString(raw.reelScript),
    hooks: ensureStringArray(raw.hooks),
    ctas: ensureStringArray(raw.ctas),
    linkedin: ensureString(raw.linkedin),
    twitter: ensureString(raw.twitter),
    instagram: ensureString(raw.instagram),
    hashtags: ensureStringArray(raw.hashtags),
  };
}

/**
 * Generates repurposed content (reel script, hooks, CTAs, platform captions, hashtags) from a newsletter body.
 * Caller should map thrown errors to HTTP responses (503, 429, 502, 500).
 * @param clientOverride - Optional OpenAI client (e.g. fallback key when primary is rate limited).
 */
export async function generateRepurposeContent(
  input: RepurposeInput,
  clientOverride?: OpenAI,
): Promise<RepurposeOutput> {
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
