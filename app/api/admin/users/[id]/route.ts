import type { NextRequest } from "next/server";

import { fail, handler, ok, zodFields } from "@/lib/api/respond";
import { hashPassword } from "@/lib/auth/password";
import { requireOwner } from "@/lib/auth/session";
import { db } from "@/lib/db/connect";
import { Admin } from "@/lib/db/models";
import { adminUserUpdate } from "@/lib/validation/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** True if removing/demoting/deactivating `id` would leave zero active owners. */
async function isLastActiveOwner(id: string) {
  const target = await Admin.findById(id).select("role isActive").lean();
  if (!target || target.role !== "owner" || !target.isActive) return false;

  const otherActiveOwners = await Admin.countDocuments({
    _id: { $ne: id },
    role: "owner",
    isActive: true,
  });
  return otherActiveOwners === 0;
}

export const GET = handler(async (request: NextRequest, { params }: Ctx) => {
  await requireOwner(request);
  const { id } = await params;

  await db();
  const admin = await Admin.findById(id)
    .select("email name role isActive lastLoginAt createdAt")
    .lean();
  if (!admin) return fail("NOT_FOUND", "That admin no longer exists.");

  return ok(admin);
});

export const PATCH = handler(async (request: NextRequest, { params }: Ctx) => {
  const session = await requireOwner(request);
  const { id } = await params;

  const parsed = adminUserUpdate.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return fail("VALIDATION_FAILED", "Some fields need attention.", zodFields(parsed.error));
  }

  await db();
  const admin = await Admin.findById(id);
  if (!admin) return fail("NOT_FOUND", "That admin no longer exists.");

  const isSelf = String(admin._id) === session.sub;
  const demoting = parsed.data.role === "editor" && admin.role === "owner";
  const deactivating = parsed.data.isActive === false && admin.isActive;

  // Never let an owner lock themselves out mid-session — ask another owner.
  if (isSelf && (demoting || deactivating)) {
    return fail(
      "FORBIDDEN",
      "You cannot remove your own owner access or deactivate your own account. Ask another owner to do this.",
    );
  }

  if ((demoting || deactivating) && (await isLastActiveOwner(id))) {
    return fail(
      "FORBIDDEN",
      "This is the only active owner. Promote another admin to owner first.",
    );
  }

  if (parsed.data.name !== undefined) admin.name = parsed.data.name;
  if (parsed.data.role !== undefined) admin.role = parsed.data.role;
  if (parsed.data.isActive !== undefined) admin.isActive = parsed.data.isActive;
  if (parsed.data.password) admin.passwordHash = await hashPassword(parsed.data.password);

  await admin.save();

  return ok({
    _id: admin._id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    isActive: admin.isActive,
    lastLoginAt: admin.lastLoginAt ?? null,
    createdAt: admin.createdAt,
  });
});

export const DELETE = handler(async (request: NextRequest, { params }: Ctx) => {
  const session = await requireOwner(request);
  const { id } = await params;

  if (id === session.sub) {
    return fail("FORBIDDEN", "You cannot delete your own account. Ask another owner to do this.");
  }

  await db();

  if (await isLastActiveOwner(id)) {
    return fail(
      "FORBIDDEN",
      "This is the only active owner. Promote another admin to owner first.",
    );
  }

  const admin = await Admin.findByIdAndDelete(id).lean();
  if (!admin) return fail("NOT_FOUND", "That admin no longer exists.");

  return ok({ deleted: true });
});
