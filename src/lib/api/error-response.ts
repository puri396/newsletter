import { NextResponse } from "next/server";

export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  AI_SERVICE_UNAVAILABLE: "AI_SERVICE_UNAVAILABLE",
  AI_RATE_LIMIT: "AI_RATE_LIMIT",
  AI_INVALID_RESPONSE: "AI_INVALID_RESPONSE",
  EMAIL_FAILED: "EMAIL_FAILED",
  DATABASE_ERROR: "DATABASE_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export interface ApiErrorPayload {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export function errorResponse(
  code: ErrorCode,
  message: string,
  status: number,
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: { code, message },
    } satisfies ApiErrorPayload,
    { status },
  );
}
