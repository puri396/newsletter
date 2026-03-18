/**
 * Generate a URL-safe slug from a string.
 * Converts to lowercase, replaces spaces/non-alnum with hyphens, de-duplicates hyphens.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Generate a unique slug by appending a numeric suffix if the base slug
 * is already taken. Caller must provide an async checker function.
 */
export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  let slug = slugify(base);
  let suffix = 0;
  // eslint-disable-next-line no-await-in-loop
  while (await exists(slug)) {
    suffix += 1;
    slug = `${slugify(base)}-${suffix}`;
  }
  return slug;
}
