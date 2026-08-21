import type { NextRequest } from "next/server";

import { created, fail, handler, ok, zodFields } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/auth/session";
import { TAGS, bustHome } from "@/lib/cache";
import { db } from "@/lib/db/connect";
import { Category, Package } from "@/lib/db/models";
import { categoryCreate } from "@/lib/validation/schemas";

export const runtime = "nodejs";

/** Public: active master packages, in admin-defined order. */
export const GET = handler(async (request: NextRequest) => {
  await db();

  const withCounts =
    request.nextUrl.searchParams.get("includeCounts") === "true";

  const categories = await Category.find({ isActive: true })
    .select("name slug tagline description thumbnail heroImage icon order")
    .sort({ order: 1 })
    .lean();

  if (!withCounts) return ok(categories);

  // One grouped read rather than a count per category.
  const counts = await Package.aggregate<{ _id: string; count: number }>([
    { $match: { isActive: true } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);

  const byId = new Map(counts.map((row) => [String(row._id), row.count]));

  return ok(
    categories.map((category) => ({
      ...category,
      packageCount: byId.get(String(category._id)) ?? 0,
    })),
  );
});

export const POST = handler(async (request: NextRequest) => {
  await requireAdmin(request);

  const parsed = categoryCreate.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return fail("VALIDATION_FAILED", "Some fields need attention.", zodFields(parsed.error));
  }

  await db();
  const category = await Category.create(parsed.data);

  bustHome(TAGS.categories);
  return created(category.toJSON());
});
