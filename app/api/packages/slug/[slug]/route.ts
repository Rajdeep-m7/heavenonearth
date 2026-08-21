import { handler, fail, ok } from "@/lib/api/respond";
import { db } from "@/lib/db/connect";
import { Package, Review, aggregateRating } from "@/lib/db/models";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ slug: string }> };

/** Public detail: the package plus its approved reviews and rating. */
export const GET = handler(async (_request: Request, { params }: Ctx) => {
  const { slug } = await params;
  await db();

  const pkg = await Package.findOne({ slug, isActive: true })
    .populate("category", "name slug")
    .lean();

  if (!pkg) return fail("NOT_FOUND", "That journey is not available.");

  const [reviews, rating] = await Promise.all([
    Review.find({ package: pkg._id, status: "approved" })
      .select("author quote rating trip avatar publishedAt")
      .sort({ publishedAt: -1 })
      .limit(12)
      .lean(),
    aggregateRating({ package: pkg._id }),
  ]);

  return ok({ package: pkg, reviews, rating });
});
