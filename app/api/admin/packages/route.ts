import type { NextRequest } from "next/server";

import { handler, ok } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db/connect";
import { Package } from "@/lib/db/models";

type QueryFilter = Record<string, unknown>;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Neutralises regex metacharacters so a search for "4 Days / 3 Nights (Deluxe)"
 * matches literally instead of blowing up or matching unintended rows.
 */
function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const GET = handler(async (request: NextRequest) => {
  await requireAdmin(request);
  await db();

  const params = request.nextUrl.searchParams;
  const filter: QueryFilter = {};

  const status = params.get("status");
  if (status === "active") filter.isActive = true;
  if (status === "inactive") filter.isActive = false;

  const category = params.get("category");
  if (category) filter.category = category;

  const q = params.get("q");
  if (q) filter.title = new RegExp(escapeRegExp(q), "i");

  const items = await Package.find(filter)
    .select("title slug summary days nights priceFrom coverImage badge isActive isFeatured order category")
    .populate("category", "name slug")
    .sort({ order: 1, createdAt: -1 })
    .limit(200)
    .lean();

  return ok(items, { total: items.length });
});
