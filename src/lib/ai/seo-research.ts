import { getGeminiClient } from "./gemini-client";
import { getOpenAIClient } from "./client";

export interface SeoResearchInput {
  topic: string;
  existingTags?: string[];
  targetAudience?: string;
}

export interface SeoResearchOutput {
  focusKeyword: string;
  secondaryKeywords: string[];
  searchIntent: string;
  relatedQuestions: string[];
  suggestedTitle: string;
  suggestedDescription: string;
}

function buildSystemPrompt(): string {
  return (
    "You are an expert SEO strategist. Analyze content topics and return keyword research data as JSON only.\n\n" +
    "You must respond with a single valid JSON object (no markdown, no code fence) with these keys:\n" +
    '- "focusKeyword": string, the single best primary keyword phrase (2-4 words)\n' +
    '- "secondaryKeywords": array of 5-8 secondary/LSI keyword phrases\n' +
    '- "searchIntent": string, one of "informational", "navigational", "transactional", "commercial"\n' +
    '- "relatedQuestions": array of 4-6 "People Also Ask" style questions searchers ask\n' +
    '- "suggestedTitle": string, SEO-optimized page title (under 60 characters, includes focus keyword)\n' +
    '- "suggestedDescription": string, compelling meta description (under 160 characters, includes focus keyword)\n\n' +
    "Focus on realistic, rankable keywords — not overly broad or overly niche terms."
  );
}

function buildUserPrompt(input: SeoResearchInput): string {
  const parts = [`Topic: ${input.topic.trim()}`];
  if (input.targetAudience) parts.push(`Target audience: ${input.targetAudience.trim()}`);
  if (input.existingTags?.length) {
    parts.push(`Existing tags/categories: ${input.existingTags.join(", ")}`);
  }
  parts.push("\nReturn keyword research as JSON.");
  return parts.join("\n\n");
}

function stripJsonFence(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/);
  return match ? match[1].trim() : trimmed;
}

function parseResponse(text: string): SeoResearchOutput {
  const raw = JSON.parse(stripJsonFence(text)) as Record<string, unknown>;

  const getString = (key: string): string => {
    const v = raw[key];
    return typeof v === "string" ? v.trim() : "";
  };

  const getStrArr = (key: string): string[] => {
    const v = raw[key];
    if (!Array.isArray(v)) return [];
    return (v as unknown[]).filter((x): x is string => typeof x === "string").map((s) => s.trim()).filter(Boolean);
  };

  return {
    focusKeyword: getString("focusKeyword") || getString("focus_keyword") || input_fallback(raw),
    secondaryKeywords: getStrArr("secondaryKeywords") || getStrArr("secondary_keywords"),
    searchIntent: getString("searchIntent") || getString("search_intent") || "informational",
    relatedQuestions: getStrArr("relatedQuestions") || getStrArr("related_questions"),
    suggestedTitle: getString("suggestedTitle") || getString("suggested_title"),
    suggestedDescription: getString("suggestedDescription") || getString("suggested_description"),
  };
}

function input_fallback(raw: Record<string, unknown>): string {
  const v = raw["keyword"] ?? raw["primaryKeyword"] ?? raw["primary_keyword"];
  return typeof v === "string" ? v.trim() : "";
}

export async function generateSeoResearch(
  input: SeoResearchInput,
): Promise<SeoResearchOutput> {
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(input);

  const gemini = getGeminiClient();
  if (gemini) {
    try {
      const response = await gemini.models.generateContent({
        model: process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash",
        contents: userPrompt,
        systemInstruction: systemPrompt,
        config: { temperature: 0.4 },
      });

      const text =
        (response as { text?: string }).text?.trim() ??
        (response as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> })
          .candidates?.[0]?.content?.parts?.map((p) => p?.text).filter(Boolean).join("") ??
        "";

      if (text) return parseResponse(text);
    } catch {
      // fall through to OpenAI
    }
  }

  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.4,
  });

  const content = completion.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("AI returned empty SEO research response.");
  return parseResponse(content);
}
