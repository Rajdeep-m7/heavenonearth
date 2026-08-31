import { fail, handler, ok } from "@/lib/api/respond";
import { db } from "@/lib/db/connect";
import { Category, Package } from "@/lib/db/models";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ slug: string }> };

/** Public detail: the category plus its active packages. */
export const GET = handler(async (_request: Request, { params }: Ctx) => {
  const { slug } = await params;
  await db();

  const category = await Category.findOne({ slug, isActive: true }).lean();
  if (!category) return fail("NOT_FOUND", "That destination is not available.");

  const packages = await Package.find({ category: category._id, isActive: true })
    .select("title slug summary destination days nights priceFrom coverImage badge")
    .sort({ order: 1 })
    .lean();

  return ok({ category, packages });
});
