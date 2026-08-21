import type { NextRequest } from "next/server";

import { created, fail, handler, ok, zodFields } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/auth/session";
import { TAGS, bust } from "@/lib/cache";
import { db } from "@/lib/db/connect";
import { Category, GalleryItem } from "@/lib/db/models";
import { galleryCreate, listQuery } from "@/lib/validation/schemas";

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

  const tag = params.get("tag");
  if (tag) filter.tags = tag;

  const [items, total] = await Promise.all([
    GalleryItem.find(filter)
      .select("image title caption tags order")
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    GalleryItem.countDocuments(filter),
  ]);

  return ok(items, { page, limit, total, pages: Math.ceil(total / limit) });
});

/** Accepts one item or a batch, so a multi-file upload commits in one request. */
export const POST = handler(async (request: NextRequest) => {
  await requireAdmin(request);

  const parsed = galleryCreate.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return fail("VALIDATION_FAILED", "Some fields need attention.", zodFields(parsed.error));
  }

  const items = "items" in parsed.data ? parsed.data.items : [parsed.data];

  await db();
  const inserted = await GalleryItem.insertMany(items, { ordered: false });

  bust(TAGS.gallery);
  return created(inserted, { count: inserted.length });
});
