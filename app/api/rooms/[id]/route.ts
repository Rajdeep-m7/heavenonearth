import type { NextRequest } from "next/server";

import { fail, handler, ok, zodFields } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/auth/session";
import { TAGS, bustHome } from "@/lib/cache";
import { db } from "@/lib/db/connect";
import { Room, Stay, syncStayPriceFrom } from "@/lib/db/models";
import { destroyImages } from "@/lib/cloudinary/server";
import { roomUpdate } from "@/lib/validation/schemas";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

async function bustForStay(stayId: string) {
  const stay = await Stay.findById(stayId).select("slug").lean();
  bustHome(TAGS.stays, ...(stay ? [TAGS.stay(stay.slug)] : []));
}

export const PATCH = handler(async (request: NextRequest, { params }: Ctx) => {
  await requireAdmin(request);
  const { id } = await params;

  const parsed = roomUpdate.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return fail("VALIDATION_FAILED", "Some fields need attention.", zodFields(parsed.error));
  }

  await db();
  const room = await Room.findByIdAndUpdate(id, parsed.data, {
    new: true,
    runValidators: true,
  }).lean();

  if (!room) return fail("NOT_FOUND", "That room no longer exists.");

  // priceFrom is denormalised, so it must be recomputed on every room write.
  await syncStayPriceFrom(String(room.stay));
  await bustForStay(String(room.stay));

  return ok(room);
});

export const DELETE = handler(async (request: NextRequest, { params }: Ctx) => {
  await requireAdmin(request);
  const { id } = await params;

  await db();
  const room = await Room.findByIdAndDelete(id).lean();
  if (!room) return fail("NOT_FOUND", "That room no longer exists.");

  await destroyImages(room.images ?? []);
  await syncStayPriceFrom(String(room.stay));
  await bustForStay(String(room.stay));

  return ok({ deleted: true });
});
