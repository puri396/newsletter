/**
 * Minimal email format check (must contain @ and a domain part).
 * For stricter validation, consider a library like validator.js or zod.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;
  return EMAIL_REGEX.test(trimmed);
}

export interface SubscriberDto {
  id: string;
  email: string;
  name: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  unsubscribedAt: string | null;
}

export function toSubscriberDto(row: {
  id: string;
  email: string;
  name: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  unsubscribedAt: Date | null;
}): SubscriberDto {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    unsubscribedAt: row.unsubscribedAt?.toISOString() ?? null,
  };
}
