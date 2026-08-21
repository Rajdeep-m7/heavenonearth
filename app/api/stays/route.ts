import type { NextRequest } from "next/server";

import { created, fail, handler, ok, zodFields } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/auth/session";
import { TAGS, bustHome } from "@/lib/cache";
import { db } from "@/lib/db/connect";
import { Category, Stay } from "@/lib/db/models";
import { listQuery, stayCreate } from "@/lib/validation/schemas";

/** Mongoose 9 no longer exports FilterQuery; this is all we needed. */
type QueryFilter = Record<string, unknown>;

export const runtime = "nodejs";

export const GET = handler(async (request: NextRequest) => {
  const params = request.nextUrl.searchParams;

  const parsed = listQuery.safeParse(Object.fromEntries(params));
  if (!parsed.success) {
    return fail("VALIDATION_FAILED", "Bad query.", zodFields(parsed.error));
  }
  const { page, limit } = parsed.data;

  await db();

  const filter: QueryFilter = { isActive: true };

  const categorySlug = params.get("category");
  if (categorySlug) {
    const category = await Category.findOne({ slug: categorySlug }).select("_id").lean();
    if (!category) return ok([], { page, limit, total: 0, pages: 0 });
    filter.category = category._id;
  }

  if (params.get("featured") === "true") filter.isFeatured = true;

  const propertyType = params.get("propertyType");
  if (propertyType) filter.propertyType = propertyType;

  const locality = params.get("locality");
  if (locality) filter["location.locality"] = new RegExp(`^${locality}$`, "i");

  const max = params.get("maxPrice");
  if (max) filter.priceFrom = { $lte: Number(max) };

  const [items, total] = await Promise.all([
    Stay.find(filter)
      .select("name slug summary coverImage location propertyType priceFrom currency highlights")
      .sort({ order: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Stay.countDocuments(filter),
  ]);

  return ok(items, { page, limit, total, pages: Math.ceil(total / limit) });
});

export const POST = handler(async (request: NextRequest) => {
  await requireAdmin(request);

  const parsed = stayCreate.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return fail("VALIDATION_FAILED", "Some fields need attention.", zodFields(parsed.error));
  }

  await db();
  const stay = await Stay.create(parsed.data);

  bustHome(TAGS.stays, TAGS.stay(stay.slug));
  return created(stay.toJSON());
});
