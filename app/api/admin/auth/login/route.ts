import { NextResponse, type NextRequest } from "next/server";

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
