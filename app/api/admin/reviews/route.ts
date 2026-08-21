import type { NextRequest } from "next/server";

import { created, fail, handler, ok, zodFields } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/auth/session";
import { TAGS, bustHome } from "@/lib/cache";
import { db } from "@/lib/db/connect";
import { Review } from "@/lib/db/models";
import { listQuery, reviewAdminCreate } from "@/lib/validation/schemas";

/** Mongoose 9 no longer exports FilterQuery; this is all we needed. */
type QueryFilter = Record<string, unknown>;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Admin queue — the only place pending reviews are readable. */
export const GET = handler(async (request: NextRequest) => {
  await requireAdmin(request);

  const params = request.nextUrl.searchParams;
  const parsed = listQuery.safeParse(Object.fromEntries(params));
  if (!parsed.success) {
    return fail("VALIDATION_FAILED", "Bad query.", zodFields(parsed.error));
  }
  const { page, limit } = parsed.data;

  await db();

  const filter: QueryFilter = {};
  const status = params.get("status");
  if (status && ["pending", "approved", "rejected"].includes(status)) {
    filter.status = status;
  }

  const [items, total, pending] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Review.countDocuments(filter),
    Review.countDocuments({ status: "pending" }),
  ]);

  return ok(items, { page, limit, total, pages: Math.ceil(total / limit), pending });
});

/** Admin-authored review — approved immediately, no moderation step. */
export const POST = handler(async (request: NextRequest) => {
  await requireAdmin(request);

  const parsed = reviewAdminCreate.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return fail("VALIDATION_FAILED", "Some fields need attention.", zodFields(parsed.error));
  }

  await db();
  const review = await Review.create({
    ...parsed.data,
    status: "approved",
    source: "admin",
    publishedAt: new Date(),
  });

  bustHome(TAGS.reviews);
  return created(review.toJSON());
});
