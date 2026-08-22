import type { NextRequest } from "next/server";

import { fail, handler, ok, zodFields } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/auth/session";
import { TAGS, bustHome } from "@/lib/cache";
import { db } from "@/lib/db/connect";
import { Room, Stay } from "@/lib/db/models";
import { stayUpdate } from "@/lib/validation/schemas";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/** Admin single-record read — the edit form's loader. */
export const GET = handler(async (request: NextRequest, { params }: Ctx) => {
  await requireAdmin(request);
  const { id } = await params;

  await db();
  const doc = await Stay.findById(id).populate("category", "name slug").lean();
  if (!doc) return fail("NOT_FOUND", "That stay no longer exists.");

  return ok(doc);
});

export const PATCH = handler(async (request: NextRequest, { params }: Ctx) => {
  await requireAdmin(request);
  const { id } = await params;

  const parsed = stayUpdate.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return fail("VALIDATION_FAILED", "Some fields need attention.", zodFields(parsed.error));
  }

  await db();
  const stay = await Stay.findById(id);
  if (!stay) return fail("NOT_FOUND", "That stay no longer exists.");

  const previousSlug = stay.slug;
  stay.set(parsed.data);
  await stay.save();

  bustHome(TAGS.stays, TAGS.stay(stay.slug), TAGS.stay(previousSlug));
  return ok(stay.toJSON());
});

export const DELETE = handler(async (request: NextRequest, { params }: Ctx) => {
  await requireAdmin(request);
  const { id } = await params;

  await db();
  const stay = await Stay.findByIdAndDelete(id).lean();
  if (!stay) return fail("NOT_FOUND", "That stay no longer exists.");

  // Rooms have no meaning without their property.
  await Room.deleteMany({ stay: id });

  bustHome(TAGS.stays, TAGS.stay(stay.slug));
  return ok({ deleted: true });
});
