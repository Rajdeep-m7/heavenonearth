import type { NextRequest } from "next/server";

import { fail, handler, ok, zodFields } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/auth/session";
import { TAGS, bust } from "@/lib/cache";
import { db } from "@/lib/db/connect";
import { GalleryItem } from "@/lib/db/models";
import { galleryReorder } from "@/lib/validation/schemas";

export const runtime = "nodejs";

/** One bulkWrite rather than N sequential updates. */
export const PATCH = handler(async (request: NextRequest) => {
  await requireAdmin(request);

  const parsed = galleryReorder.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return fail("VALIDATION_FAILED", "Bad ordering payload.", zodFields(parsed.error));
  }

  await db();
  await GalleryItem.bulkWrite(
    parsed.data.order.map((id, index) => ({
      updateOne: { filter: { _id: id }, update: { $set: { order: index } } },
    })),
  );

  bust(TAGS.gallery);
  return ok({ reordered: parsed.data.order.length });
});
