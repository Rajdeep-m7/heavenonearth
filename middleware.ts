import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, verifySession } from "@/lib/auth/jwt";

/**
 * Runs on the Edge runtime, so it must stay dependency-light — `jose` is Web
 * Crypto based and works here; mongoose and bcryptjs do not.
 *
 * This is defence in depth. Mutating routes outside /api/admin/* still call
 * requireAdmin() themselves.
 */

const PUBLIC_PATHS = new Set(["/admin/login", "/api/admin/auth/login"]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (session) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { ok: false, error: { code: "UNAUTHORIZED", message: "Please sign in to continue." } },
      { status: 401 },
    );
  }

  const login = new URL("/admin/login", request.url);
  login.searchParams.set("next", pathname);

  const response = NextResponse.redirect(login);
  // Clear a stale cookie so the browser stops sending it.
  response.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
