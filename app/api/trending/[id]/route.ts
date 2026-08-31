import type { NextRequest } from "next/server";

import { fail, handler, ok, zodFields } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/auth/session";
import { TAGS, bustHome } from "@/lib/cache";
import { destroyAsset } from "@/lib/cloudinary/server";
import { db } from "@/lib/db/connect";
import { Trending } from "@/lib/db/models";
import { trendingUpdate } from "@/lib/validation/schemas";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = handler(async (request: NextRequest, { params }: Ctx) => {
  await requireAdmin(request);
  const { id } = await params;

  const parsed = trendingUpdate.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return fail("VALIDATION_FAILED", "Some fields need attention.", zodFields(parsed.error));
  }

  await db();
  const item = await Trending.findByIdAndUpdate(id, parsed.data, {
    new: true,
    runValidators: true,
  }).lean();

  if (!item) return fail("NOT_FOUND", "That destination no longer exists.");

  bustHome(TAGS.trending);
  return ok(item);
});

export const DELETE = handler(async (request: NextRequest, { params }: Ctx) => {
  await requireAdmin(request);
  const { id } = await params;

  await db();
  const item = await Trending.findByIdAndDelete(id).lean();
  if (!item) return fail("NOT_FOUND", "That destination no longer exists.");

  await destroyAsset(item.image.publicId).catch(() => undefined);

  bustHome(TAGS.trending);
  return ok({ deleted: true });
});
