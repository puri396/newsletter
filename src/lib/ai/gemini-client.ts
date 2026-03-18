import { GoogleGenAI } from "@google/genai";

const ENV_KEY = "GEMINI_API_KEY";

/**
 * Returns a configured Gemini (Google GenAI) client when GEMINI_API_KEY is set.
 * Uses v1beta (SDK default) with a model that supports it (e.g. gemini-2.0-flash).
 * Returns null otherwise (caller can fall back to OpenAI).
 */
export function getGeminiClient(): GoogleGenAI | null {
  const raw = process.env[ENV_KEY];
  const apiKey = raw?.trim();
  // #region agent log
  void fetch("http://127.0.0.1:7242/ingest/65a4a47d-5807-4059-a768-a0af34f387fe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: `log_${Date.now()}_GEMINI_KEY_META`,
      runId: "debug-gemini-key",
      hypothesisId: "H_GEMINI_KEY_FORMAT",
      location: "src/lib/ai/gemini-client.ts:getGeminiClient",
      message: "Gemini key metadata (non-secret)",
      data: {
        hasEnvValue: typeof raw === "string" && raw.length > 0,
        rawLength: typeof raw === "string" ? raw.length : null,
        trimmedLength: typeof apiKey === "string" ? apiKey.length : null,
        hasWhitespace: typeof raw === "string" ? /\s/.test(raw) : null,
        startsWithAIza: typeof apiKey === "string" ? apiKey.startsWith("AIza") : null,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion agent log
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}
