import type { NextRequest } from "next/server";

import { created, fail, handler, ok, zodFields } from "@/lib/api/respond";
import { hashPassword } from "@/lib/auth/password";
import { requireOwner } from "@/lib/auth/session";
import { db } from "@/lib/db/connect";
import { Admin } from "@/lib/db/models";
import { adminUserCreate } from "@/lib/validation/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin-user management. Deliberately separate from every other /api/admin
 * route: only an `owner` may reach these, never a plain `editor` — enforced
 * here with requireOwner(), not just requireAdmin().
 */
export const GET = handler(async (request: NextRequest) => {
  await requireOwner(request);
  await db();

  const admins = await Admin.find({})
    .select("email name role isActive lastLoginAt createdAt")
    .sort({ createdAt: 1 })
    .lean();

  return ok(admins);
});

export const POST = handler(async (request: NextRequest) => {
  await requireOwner(request);

  const parsed = adminUserCreate.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return fail("VALIDATION_FAILED", "Some fields need attention.", zodFields(parsed.error));
  }

  await db();

  const email = parsed.data.email.toLowerCase();
  const clash = await Admin.exists({ email });
  if (clash) {
    return fail("SLUG_TAKEN", "An admin with that email already exists.", {
      email: "Already in use",
    });
  }

  const admin = await Admin.create({
    email,
    name: parsed.data.name,
    role: parsed.data.role,
    passwordHash: await hashPassword(parsed.data.password),
  });

  return created({
    _id: admin._id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    isActive: admin.isActive,
    lastLoginAt: admin.lastLoginAt ?? null,
    createdAt: admin.createdAt,
  });
});
