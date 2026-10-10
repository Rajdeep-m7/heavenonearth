import type { NextRequest } from "next/server";

import { fail, handler, ok, zodFields } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/auth/session";
import { TAGS, bustHome } from "@/lib/cache";
import { db } from "@/lib/db/connect";
import { Review } from "@/lib/db/models";
import { destroyImages } from "@/lib/cloudinary/server";
import { reviewModerate } from "@/lib/validation/schemas";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/** Moderation. Approving stamps publishedAt and refreshes the public pages. */
export const PATCH = handler(async (request: NextRequest, { params }: Ctx) => {
  await requireAdmin(request);
  const { id } = await params;

  const parsed = reviewModerate.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return fail("VALIDATION_FAILED", "Some fields need attention.", zodFields(parsed.error));
  }

  await db();
  const review = await Review.findById(id);
  if (!review) return fail("NOT_FOUND", "That review no longer exists.");

  const wasApproved = review.status === "approved";
  review.set(parsed.data);

  if (review.status === "approved" && !review.publishedAt) {
    review.publishedAt = new Date();
  }
  await review.save();

  // Only touch the cache when public visibility actually changed.
  if (wasApproved || review.status === "approved") bustHome(TAGS.reviews);

  return ok(review.toJSON());
});

export const DELETE = handler(async (request: NextRequest, { params }: Ctx) => {
  await requireAdmin(request);
  const { id } = await params;

  await db();
  const review = await Review.findByIdAndDelete(id).lean();
  if (!review) return fail("NOT_FOUND", "That review no longer exists.");

  await destroyImages([review.avatar]);

  if (review.status === "approved") bustHome(TAGS.reviews);
  return ok({ deleted: true });
});
