import "server-only";

import { unstable_cache } from "next/cache";

import { REVALIDATE_SECONDS, TAGS } from "@/lib/cache";
import { db } from "@/lib/db/connect";
import { Category, GalleryItem } from "@/lib/db/models";
import { leanJson, pickImage, type Image } from "@/lib/db/shared";

export type GalleryCard = {
  _id: string;
  image: Image;
  title?: string;
  caption?: string;
};

const PAGE_SIZE = 24;

/** The `/gallery` grid, optionally filtered by category slug. */
export const getGalleryItems = (categorySlug: string | undefined, page: number) =>
  unstable_cache(
    async (): Promise<{ items: GalleryCard[]; total: number; pages: number }> => {
      await db();

      const filter: Record<string, unknown> = { isActive: true };

      if (categorySlug) {
        const category = await Category.findOne({ slug: categorySlug })
          .select("_id")
          .lean();
        if (!category) return { items: [], total: 0, pages: 0 };
        filter.category = category._id;
      }

      const [items, total] = await Promise.all([
        GalleryItem.find(filter)
          .select("image title caption")
          .sort({ order: 1, createdAt: -1 })
          .skip((page - 1) * PAGE_SIZE)
          .limit(PAGE_SIZE)
          .lean(),
        GalleryItem.countDocuments(filter),
      ]);

      return leanJson({
        items: items.map((item) => ({
          _id: String(item._id),
          image: pickImage(item.image)!,
          title: item.title ?? undefined,
          caption: item.caption ?? undefined,
        })),
        total,
        pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      });
    },
    ["gallery-list", categorySlug ?? "all", String(page)],
    { tags: [TAGS.gallery, TAGS.categories], revalidate: REVALIDATE_SECONDS },
  )();
