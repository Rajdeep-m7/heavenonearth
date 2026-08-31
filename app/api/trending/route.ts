import type { NextRequest } from "next/server";

import { created, fail, handler, ok, zodFields } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/auth/session";
import { TAGS, bustHome } from "@/lib/cache";
import { db } from "@/lib/db/connect";
import { Trending } from "@/lib/db/models";
import { trendingCreate } from "@/lib/validation/schemas";

export const runtime = "nodejs";

export const GET = handler(async () => {
  await requireAdmin();
  await db();

  const items = await Trending.find({})
    .sort({ tab: 1, order: 1, createdAt: -1 })
    .lean();

  return ok(items, { total: items.length });
});

export const POST = handler(async (request: NextRequest) => {
  await requireAdmin(request);

  const parsed = trendingCreate.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return fail("VALIDATION_FAILED", "Some fields need attention.", zodFields(parsed.error));
  }

  await db();
  const inserted = await Trending.create(parsed.data);

  bustHome(TAGS.trending);
  return created(inserted);
});
