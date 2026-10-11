import type { NextRequest } from "next/server";

import { fail, handler, ok, zodFields } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/auth/session";
import { TAGS, bustHome } from "@/lib/cache";
import { db } from "@/lib/db/connect";
import { HeroSlide } from "@/lib/db/models";
import { heroReorder } from "@/lib/validation/schemas";

export const runtime = "nodejs";

/** Body is every slide id in the new order; one bulkWrite applies it. */
export const PATCH = handler(async (request: NextRequest) => {
  await requireAdmin(request);

  const parsed = heroReorder.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return fail("VALIDATION_FAILED", "Bad ordering payload.", zodFields(parsed.error));
  }

  await db();
  await HeroSlide.bulkWrite(
    parsed.data.order.map((id, index) => ({
      updateOne: { filter: { _id: id }, update: { $set: { order: index } } },
    })),
  );

  bustHome(TAGS.hero);
  return ok({ reordered: parsed.data.order.length });
});
