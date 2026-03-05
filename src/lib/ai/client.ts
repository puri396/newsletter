import OpenAI from "openai";

const ENV_KEY = "OPENAI_API_KEY";
const ENV_KEY_ALT = "OPENAI_API_KEY_2";

/**
 * Returns a configured OpenAI client for server-side use (primary key).
 * API key is read from env only — never exposed to the client.
 *
 * @throws Error if OPENAI_API_KEY is missing or empty (caller should return 503/500)
 */
export function getOpenAIClient(): OpenAI {
  const apiKey = process.env[ENV_KEY]?.trim();
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set. Configure it in your environment to use AI features.",
    );
  }
  return new OpenAI({
    apiKey,
    maxRetries: 5,
  });
}

/**
 * Returns an OpenAI client using OPENAI_API_KEY_2 if set.
 * Use as fallback when the primary key returns 429 (rate limit).
 * Returns null if OPENAI_API_KEY_2 is not set.
 */
export function getOpenAIClientFallback(): OpenAI | null {
  const apiKey = process.env[ENV_KEY_ALT]?.trim();
  if (!apiKey) return null;
  return new OpenAI({
    apiKey,
    maxRetries: 2,
  });
}
