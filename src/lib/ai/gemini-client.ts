import { GoogleGenAI } from "@google/genai";

const ENV_KEY = "GEMINI_API_KEY";

/**
 * Returns a configured Gemini (Google GenAI) client when GEMINI_API_KEY is set.
 * Uses v1beta (SDK default) with a model that supports it (e.g. gemini-2.0-flash).
 * Returns null otherwise (caller can fall back to OpenAI).
 */
export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env[ENV_KEY]?.trim();
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}
