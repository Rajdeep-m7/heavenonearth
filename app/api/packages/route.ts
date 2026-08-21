import type { NextRequest } from "next/server";

import { created, fail, handler, ok, zodFields } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/auth/session";
import { TAGS, bustHome } from "@/lib/cache";
import { db } from "@/lib/db/connect";
import { Category, Package } from "@/lib/db/models";
import { listQuery, packageCreate } from "@/lib/validation/schemas";

/** Mongoose 9 no longer exports FilterQuery; this is all we needed. */
type QueryFilter = Record<string, unknown>;

export const runtime = "nodejs";

const SORTS: Record<string, Record<string, 1 | -1>> = {
  order: { order: 1 },
  priceFrom: { priceFrom: 1 },
  "-priceFrom": { priceFrom: -1 },
  "-createdAt": { createdAt: -1 },
};

/** Public listing. Every filter combination below is index-backed. */
export const GET = handler(async (request: NextRequest) => {
  const params = request.nextUrl.searchParams;

  const parsed = listQuery.safeParse(Object.fromEntries(params));
  if (!parsed.success) {
    return fail("VALIDATION_FAILED", "Bad query.", zodFields(parsed.error));
  }
  const { page, limit, q, sort } = parsed.data;

  await db();

  const filter: QueryFilter = { isActive: true };

  const categorySlug = params.get("category");
  if (categorySlug) {
    const category = await Category.findOne({ slug: categorySlug })
      .select("_id")
      .lean();
    // An unknown slug must return nothing, not everything.
    if (!category) return ok([], { page, limit, total: 0, pages: 0 });
    filter.category = category._id;
  }

  if (params.get("featured") === "true") filter.isFeatured = true;
  if (params.get("days")) filter.days = Number(params.get("days"));

  const min = params.get("minPrice");
  const max = params.get("maxPrice");
  if (min || max) {
    filter.priceFrom = {
      ...(min ? { $gte: Number(min) } : {}),
      ...(max ? { $lte: Number(max) } : {}),
    };
  }

  if (q) filter.$text = { $search: q };

  const [items, total] = await Promise.all([
    Package.find(filter)
      .select("title slug summary destination days nights priceFrom currency coverImage badge isFeatured order")
      .populate("category", "name slug")
      .sort(SORTS[sort ?? "order"] ?? SORTS.order)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Package.countDocuments(filter),
  ]);

  return ok(items, { page, limit, total, pages: Math.ceil(total / limit) });
});

export const POST = handler(async (request: NextRequest) => {
  await requireAdmin(request);

  const parsed = packageCreate.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return fail("VALIDATION_FAILED", "Some fields need attention.", zodFields(parsed.error));
  }

  await db();

  const category = await Category.findById(parsed.data.category).select("_id").lean();
  if (!category) {
    return fail("VALIDATION_FAILED", "Pick a valid category.", {
      category: "That category no longer exists",
    });
  }

  const pkg = await Package.create(parsed.data);

  bustHome(TAGS.packages, TAGS.package(pkg.slug));
  return created(pkg.toJSON());
});
