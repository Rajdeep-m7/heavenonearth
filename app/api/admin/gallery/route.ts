import { handler, ok } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db/connect";
import { GalleryItem } from "@/lib/db/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  await requireAdmin();
  await db();

  const items = await GalleryItem.find({})
    .populate("category", "name slug")
    .sort({ order: 1, createdAt: -1 })
    .limit(300)
    .lean();

  return ok(items, { total: items.length });
});
