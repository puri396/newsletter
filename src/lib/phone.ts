/**
 * E.164 phone validation and normalization for WhatsApp and other channels.
 * E.164: + followed by 10–15 digits (country code + subscriber number). No spaces or formatting.
 */

/** Valid E.164: + then 1–9, then 9–14 more digits (total 10–15 digits). */
const E164_REGEX = /^\+[1-9]\d{9,14}$/;

/** Minimum and maximum length of the digit part (excluding +). */
const MIN_DIGITS = 10;
const MAX_DIGITS = 15;

export interface NormalizeResult {
  ok: true;
  e164: string;
}

export interface NormalizeError {
  ok: false;
  error: string;
}

export type NormalizePhoneResult = NormalizeResult | NormalizeError;

/**
 * Validates that a string is in E.164 format.
 * E.164: +[country code][subscriber number], 10–15 digits total after the +.
 */
export function isValidE164(phone: string): boolean {
  if (typeof phone !== "string") return false;
  const trimmed = phone.trim();
  return trimmed.length > 0 && E164_REGEX.test(trimmed);
}

/**
 * Normalizes input to E.164 or returns an error.
 * Accepts: "+1234567890", "1234567890", "+1 234 567 890", etc.
 * Strips all non-digit characters, then prepends + if the digit sequence is valid length.
 * Does not infer or add country codes; input must contain the full number.
 */
export function normalizeToE164(input: string): NormalizePhoneResult {
  if (typeof input !== "string") {
    return { ok: false, error: "Phone must be a string." };
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { ok: false, error: "Phone is required." };
  }

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < MIN_DIGITS) {
    return {
      ok: false,
      error: `Phone must have at least ${MIN_DIGITS} digits (include country code).`,
    };
  }
  if (digits.length > MAX_DIGITS) {
    return {
      ok: false,
      error: `Phone must have at most ${MAX_DIGITS} digits.`,
    };
  }

  const e164 = `+${digits}`;
  if (!E164_REGEX.test(e164)) {
    return {
      ok: false,
      error: "Phone must start with a valid country code (e.g. +1, +44, +91).",
    };
  }

  return { ok: true, e164 };
}

/**
 * Normalizes and validates in one step. Use when persisting to DB.
 * Returns E.164 string or null if invalid (for optional phone fields).
 */
export function normalizePhoneOrNull(input: string | null | undefined): string | null {
  if (input == null || typeof input !== "string") return null;
  const result = normalizeToE164(input);
  return result.ok ? result.e164 : null;
}
