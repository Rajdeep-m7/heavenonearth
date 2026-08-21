import type { NextRequest } from "next/server";

import { created, fail, handler, ok, zodFields } from "@/lib/api/respond";
import { clientIp, rateLimit } from "@/lib/api/rateLimit";
import { TAGS, bustHome } from "@/lib/cache";
import { db } from "@/lib/db/connect";
import { Package, Review, Stay, aggregateRating } from "@/lib/db/models";
import { listQuery, reviewPublicCreate } from "@/lib/validation/schemas";

/** Mongoose 9 no longer exports FilterQuery; this is all we needed. */
type QueryFilter = Record<string, unknown>;

export const runtime = "nodejs";

/**
 * Public list. `status: "approved"` is injected here rather than taken from the
 * query, so no combination of params can ever surface a pending review.
 */
export const GET = handler(async (request: NextRequest) => {
  const params = request.nextUrl.searchParams;

  const parsed = listQuery.safeParse(Object.fromEntries(params));
  if (!parsed.success) {
    return fail("VALIDATION_FAILED", "Bad query.", zodFields(parsed.error));
  }
  const { page, limit } = parsed.data;

  await db();

  const filter: QueryFilter = { status: "approved" };
  if (params.get("featured") === "true") filter.isFeatured = true;

  const packageSlug = params.get("package");
  if (packageSlug) {
    const pkg = await Package.findOne({ slug: packageSlug }).select("_id").lean();
    if (!pkg) return ok([], { page, limit, total: 0, pages: 0, rating: null });
    filter.package = pkg._id;
  }

  const staySlug = params.get("stay");
  if (staySlug) {
    const stay = await Stay.findOne({ slug: staySlug }).select("_id").lean();
    if (!stay) return ok([], { page, limit, total: 0, pages: 0, rating: null });
    filter.stay = stay._id;
  }

  const [items, total, rating] = await Promise.all([
    Review.find(filter)
      .select("author quote rating trip location avatar publishedAt createdAt")
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Review.countDocuments(filter),
    aggregateRating(),
  ]);

  return ok(items, { page, limit, total, pages: Math.ceil(total / limit), rating });
});

/** Public submission. Creates a pending review — never visible until approved. */
export const POST = handler(async (request: NextRequest) => {
  const gate = rateLimit(`review:${clientIp(request)}`, {
    limit: 3,
    windowMs: 60 * 60 * 1000,
  });
  if (!gate.allowed) {
    return fail(
      "RATE_LIMITED",
      `Too many submissions. Try again in ${Math.ceil(gate.retryAfterSeconds / 60)} minutes.`,
    );
  }

  const parsed = reviewPublicCreate.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return fail("VALIDATION_FAILED", "Some fields need attention.", zodFields(parsed.error));
  }

  const { website, ...data } = parsed.data;

  // Honeypot: a bot filled a field no human can see. Answer 201 so it learns
  // nothing, and save nothing.
  if (website) return created({ status: "pending" });

  await db();
  await Review.create({ ...data, status: "pending", source: "web" });

  // Nothing is revalidated — a pending review changes no public page.
  return created({ status: "pending" });
});
