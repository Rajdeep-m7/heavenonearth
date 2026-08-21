import "server-only";

import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

import { ApiError } from "@/lib/api/respond";
import { SESSION_COOKIE, verifySession, type SessionPayload } from "@/lib/auth/jwt";

/** Current admin from the cookie, or null. Safe in server components. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

/**
 * First line of every mutating handler. Middleware already guards
 * /api/admin/*, but routes like POST /api/packages sit outside that matcher —
 * this is the check that actually protects them.
 */
export async function requireAdmin(
  request?: NextRequest,
): Promise<SessionPayload> {
  const token = request
    ? request.cookies.get(SESSION_COOKIE)?.value
    : (await cookies()).get(SESSION_COOKIE)?.value;

  const session = await verifySession(token);
  if (!session) {
    throw new ApiError("UNAUTHORIZED", "Please sign in to continue.");
  }
  return session;
}

export async function requireOwner(request?: NextRequest) {
  const session = await requireAdmin(request);
  if (session.role !== "owner") {
    throw new ApiError("FORBIDDEN", "This action requires an owner account.");
  }
  return session;
}
