import { handler, ok } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db/connect";
import { Category, Package } from "@/lib/db/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin list — unlike the public route this includes inactive rows, which is
 * exactly why it lives under /api/admin (middleware-guarded) instead of taking
 * an `includeInactive` flag on the public endpoint.
 */
export const GET = handler(async () => {
  await requireAdmin();
  await db();

  const [categories, counts] = await Promise.all([
    Category.find({}).sort({ order: 1, name: 1 }).lean(),
    Package.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]),
  ]);

  const byId = new Map(counts.map((row) => [String(row._id), row.count]));

  return ok(
    categories.map((category) => ({
      ...category,
      packageCount: byId.get(String(category._id)) ?? 0,
    })),
  );
});
