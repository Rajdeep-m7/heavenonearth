import { fail, handler, ok } from "@/lib/api/respond";
import { db } from "@/lib/db/connect";
import { Review, Room, Stay, aggregateRating } from "@/lib/db/models";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ slug: string }> };

/** Public detail: property, its bookable rooms, reviews and rating. */
export const GET = handler(async (_request: Request, { params }: Ctx) => {
  const { slug } = await params;
  await db();

  const stay = await Stay.findOne({ slug, isActive: true })
    .populate("category", "name slug")
    .lean();

  if (!stay) return fail("NOT_FOUND", "That stay is not available.");

  const [rooms, reviews, rating] = await Promise.all([
    Room.find({ stay: stay._id, isActive: true })
      .sort({ pricePerNight: 1, order: 1 })
      .lean(),
    Review.find({ stay: stay._id, status: "approved" })
      .select("author quote rating trip avatar publishedAt")
      .sort({ publishedAt: -1 })
      .limit(12)
      .lean(),
    aggregateRating({ stay: stay._id }),
  ]);

  return ok({ stay, rooms, reviews, rating });
});
