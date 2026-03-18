export type RequestedAiProvider = "openai" | "gemini" | "claude" | undefined;

export type SelectedAiProvider = "openai" | "gemini";

/**
 * Selects which AI provider to prefer based on:
 * - the user's requested provider (if any)
 * - which environment keys are actually configured.
 *
 * This does NOT create any SDK clients or throw if keys are missing.
 * Callers should still handle missing-key errors from the underlying helpers.
 */
export function selectAiProvider(
  requested: RequestedAiProvider,
): SelectedAiProvider {
  const hasGemini = !!process.env.GEMINI_API_KEY?.trim();
  const hasOpenAI = !!process.env.OPENAI_API_KEY?.trim();

  // Explicit request: OpenAI
  if (requested === "openai") {
    if (hasOpenAI) return "openai";
    if (hasGemini) return "gemini";
  }

  // Explicit request: Gemini
  if (requested === "gemini") {
    if (hasGemini) return "gemini";
    if (hasOpenAI) return "openai";
  }

  // Requested Claude is not yet implemented; fall back to whichever is configured.
  if (requested === "claude") {
    if (hasGemini) return "gemini";
    if (hasOpenAI) return "openai";
  }

  // No explicit preference: follow existing behavior — Gemini first when available.
  if (hasGemini) return "gemini";
  if (hasOpenAI) return "openai";

  // Default to Gemini; underlying helpers will still throw a clear error
  // if no keys are configured.
  return "gemini";
}

