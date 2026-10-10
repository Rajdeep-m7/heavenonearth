import { NextResponse } from "next/server";
import { ZodError } from "zod";

/** Every route answers in this shape, so the client never branches on prose. */

export type ApiErrorCode =
  | "VALIDATION_FAILED"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "SLUG_TAKEN"
  | "CATEGORY_IN_USE"
  | "NO_AVAILABILITY"
  | "RATE_LIMITED"
  | "SERVER_ERROR";

const STATUS: Record<ApiErrorCode, number> = {
  VALIDATION_FAILED: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SLUG_TAKEN: 409,
  CATEGORY_IN_USE: 409,
  NO_AVAILABILITY: 409,
  RATE_LIMITED: 429,
  SERVER_ERROR: 500,
};

export class ApiError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    message: string,
    readonly fields?: Record<string, string>,
    readonly data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Meta = Record<string, unknown>;

export function ok<T>(data: T, meta?: Meta, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data, ...(meta && { meta }) }, init);
}

export function created<T>(data: T, meta?: Meta) {
  return ok(data, meta, { status: 201 });
}

export function fail(
  code: ApiErrorCode,
  message: string,
  fields?: Record<string, string>,
  data?: unknown,
) {
  return NextResponse.json(
    { ok: false, error: { code, message, ...(fields && { fields }), ...(data ? { data } : {}) } },
    { status: STATUS[code] },
  );
}

/** Flattens a Zod error into `{ "priceFrom": "Must be positive" }`. */
export function zodFields(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    fields[key] ??= issue.message;
  }
  return fields;
}

/**
 * Wraps a handler so no route has to repeat try/catch. Unexpected errors are
 * logged with a reference and returned as a generic 500 — internals never reach
 * the client.
 */
export function handler<Args extends unknown[]>(
  fn: (...args: Args) => Promise<Response>,
) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof ApiError) {
        return fail(error.code, error.message, error.fields, error.data);
      }
      if (error instanceof ZodError) {
        return fail(
          "VALIDATION_FAILED",
          "Some fields need attention.",
          zodFields(error),
        );
      }

      // A malformed id or non-numeric filter reaching Mongoose is the caller's
      // mistake, not ours — answer 400 instead of a 500 with a reference code.
      if ((error as { name?: string })?.name === "CastError") {
        return fail("VALIDATION_FAILED", "That id or value is not valid.");
      }

      // Duplicate key from a unique index that slipped past the slug hook.
      const mongoError = error as { code?: number; keyPattern?: Record<string, unknown> };
      if (mongoError?.code === 11000) {
        const field = Object.keys(mongoError.keyPattern ?? {})[0] ?? "value";
        return fail("SLUG_TAKEN", `That ${field} is already taken.`, {
          [field]: "Already in use",
        });
      }

      const ref = Math.random().toString(36).slice(2, 10);
      console.error(`[api:${ref}]`, error);
      return fail(
        "SERVER_ERROR",
        `Something went wrong. Reference: ${ref}`,
      );
    }
  };
}
