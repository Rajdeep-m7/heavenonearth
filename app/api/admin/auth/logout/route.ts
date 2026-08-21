import type { NextResponse } from "next/server";

import { handler, ok } from "@/lib/api/respond";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/jwt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = handler(async () => {
  const response = ok({ signedOut: true }) as NextResponse;
  response.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
  return response;
});
