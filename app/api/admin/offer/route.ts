import type { NextRequest } from "next/server";

import { fail, handler, ok, zodFields } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/auth/session";
import { TAGS, bust } from "@/lib/cache";
import { destroyImages } from "@/lib/cloudinary/server";
import { db } from "@/lib/db/connect";
import { OfferPopup } from "@/lib/db/models";
import { offerPopupSave } from "@/lib/validation/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The single offer document, or null before the first save. */
export const GET = handler(async () => {
  await requireAdmin();
  await db();

  const offer = await OfferPopup.findOne({ key: "main" }).lean();
  return ok(offer);
});

export const PUT = handler(async (request: NextRequest) => {
  await requireAdmin(request);

  const parsed = offerPopupSave.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return fail("VALIDATION_FAILED", "Some fields need attention.", zodFields(parsed.error));
  }

  await db();
  const { image, startsAt, endsAt, ...rest } = parsed.data;
  const before = await OfferPopup.findOne({ key: "main" }).select("image").lean();

  // null means "cleared" — $unset it rather than storing a null.
  const set: Record<string, unknown> = { ...rest };
  const unset: Record<string, 1> = {};
  for (const [field, value] of [
    ["image", image],
    ["startsAt", startsAt],
    ["endsAt", endsAt],
  ] as const) {
    if (value) set[field] = value;
    else unset[field] = 1;
  }

  const offer = await OfferPopup.findOneAndUpdate(
    { key: "main" },
    { $set: set, ...(Object.keys(unset).length && { $unset: unset }) },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  ).lean();

  if (before?.image && before.image.publicId !== image?.publicId) {
    await destroyImages([before.image]);
  }

  bust(TAGS.offer);
  return ok(offer);
});
