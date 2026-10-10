import { NextResponse, type NextRequest } from "next/server";

import { clientIp, rateLimit } from "@/lib/api/rateLimit";
import { fail, handler, ok, zodFields } from "@/lib/api/respond";
import {
  SESSION_COOKIE,
  sessionCookieOptions,
  signSession,
} from "@/lib/auth/jwt";
import { verifyPassword, wastePasswordTime } from "@/lib/auth/password";
import { db } from "@/lib/db/connect";
import { Admin } from "@/lib/db/models";
import { adminLogin } from "@/lib/validation/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Same message for every failure — never reveals whether the email exists. */
const INVALID = "Invalid email or password.";

export const POST = handler(async (request: NextRequest) => {
  const parsed = adminLogin.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return fail("VALIDATION_FAILED", "Check your details.", zodFields(parsed.error));
  }

  // Throttle by address and by target account, so neither one attacker nor a
  // distributed guess at a single account gets unlimited tries.
  const window = { windowMs: 15 * 60 * 1000 };
  const byIp = rateLimit(`login:ip:${clientIp(request)}`, { limit: 10, ...window });
  const byEmail = rateLimit(`login:email:${parsed.data.email.toLowerCase()}`, {
    limit: 5,
    ...window,
  });
  if (!byIp.allowed || !byEmail.allowed) {
    const wait = Math.max(byIp.retryAfterSeconds, byEmail.retryAfterSeconds);
    return fail(
      "RATE_LIMITED",
      `Too many sign-in attempts. Try again in ${Math.ceil(wait / 60)} minutes.`,
    );
  }

  const started = Date.now();
  await db();

  const admin = await Admin.findOne({
    email: parsed.data.email.toLowerCase(),
    isActive: true,
  })
    .select("+passwordHash name email role isActive")
    .lean();

  // Burn comparable time on a missing user so response timing does not leak
  // which emails are registered.
  const valid = admin
    ? await verifyPassword(parsed.data.password, admin.passwordHash)
    : await wastePasswordTime();

  if (!admin || !valid) {
    // Floor the response at ~250 ms, smoothing out the remaining difference.
    const elapsed = Date.now() - started;
    if (elapsed < 250) await new Promise((r) => setTimeout(r, 250 - elapsed));
    return fail("UNAUTHORIZED", INVALID);
  }

  const token = await signSession({
    sub: String(admin._id),
    email: admin.email,
    role: admin.role === "owner" ? "owner" : "editor",
    name: admin.name,
  });

  // Fire-and-forget: a failed timestamp write must not fail the login.
  Admin.updateOne({ _id: admin._id }, { $set: { lastLoginAt: new Date() } })
    .catch(() => undefined);

  const response = ok({
    name: admin.name,
    email: admin.email,
    role: admin.role,
  }) as NextResponse;

  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return response;
});
