import type { NextRequest } from "next/server";

import { created, fail, handler, ok, zodFields } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/auth/session";
import { TAGS, bustHome } from "@/lib/cache";
import { db } from "@/lib/db/connect";
import { Room, Stay, syncStayPriceFrom } from "@/lib/db/models";
import { roomCreate } from "@/lib/validation/schemas";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export const GET = handler(async (_request: NextRequest, { params }: Ctx) => {
  const { id: stayId } = await params;
  await db();

  const rooms = await Room.find({ stay: stayId, isActive: true })
    .sort({ pricePerNight: 1, order: 1 })
    .lean();

  return ok(rooms);
});

export const POST = handler(async (request: NextRequest, { params }: Ctx) => {
  await requireAdmin(request);
  const { id: stayId } = await params;

  const parsed = roomCreate.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return fail("VALIDATION_FAILED", "Some fields need attention.", zodFields(parsed.error));
  }

  await db();
  const stay = await Stay.findById(stayId).select("_id slug").lean();
  if (!stay) return fail("NOT_FOUND", "That stay no longer exists.");

  const room = await Room.create({ ...parsed.data, stay: stayId });
  await syncStayPriceFrom(stayId);

  bustHome(TAGS.stays, TAGS.stay(stay.slug));
  return created(room.toJSON());
});
