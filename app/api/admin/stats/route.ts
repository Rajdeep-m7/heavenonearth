import { handler, ok } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db/connect";
import {
  Category,
  GalleryItem,
  Package,
  Review,
  Room,
  Stay,
} from "@/lib/db/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Dashboard counters — one parallel batch, all count-only. */
export const GET = handler(async () => {
  await requireAdmin();
  await db();

  const [
    categories,
    packages,
    packagesActive,
    stays,
    rooms,
    gallery,
    reviewsPending,
    reviewsApproved,
    recentReviews,
  ] = await Promise.all([
    Category.countDocuments({}),
    Package.countDocuments({}),
    Package.countDocuments({ isActive: true }),
    Stay.countDocuments({}),
    Room.countDocuments({}),
    GalleryItem.countDocuments({}),
    Review.countDocuments({ status: "pending" }),
    Review.countDocuments({ status: "approved" }),
    Review.find({})
      .select("author quote rating status createdAt")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  return ok({
    counts: {
      categories,
      packages,
      packagesActive,
      stays,
      rooms,
      gallery,
      reviewsPending,
      reviewsApproved,
    },
    recentReviews,
  });
});
