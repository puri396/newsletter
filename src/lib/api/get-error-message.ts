/**
 * Extracts a user-facing error message from an API error response.
 * Supports both legacy { error: string } and new { success: false, error: { code, message } }.
 */
export function getApiErrorMessage(
  json: { success?: boolean; error?: string | { code?: string; message?: string } },
  fallback = "Something went wrong. Please try again.",
): string {
  if (json.success === false && json.error && typeof json.error === "object" && "message" in json.error) {
    return typeof json.error.message === "string" ? json.error.message : fallback;
  }
  if (typeof json.error === "string") {
    return json.error;
  }
  return fallback;
}
