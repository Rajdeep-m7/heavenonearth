import "server-only";

import { unstable_cache } from "next/cache";

import { REVALIDATE_SECONDS, TAGS } from "@/lib/cache";
import { db } from "@/lib/db/connect";
import { Category, Package } from "@/lib/db/models";
import { leanJson, pickImage, type Image, type Seo } from "@/lib/db/shared";

export type SlugEntry = { slug: string; updatedAt?: Date };

export type CategorySummary = {
  _id: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  thumbnail?: Image;
  heroImage?: Image;
  packageCount: number;
};

export type CategoryDetail = CategorySummary & {
  seo?: Seo;
};

/** All active categories, admin-ordered, with a live package count each. */
export const getCategories = unstable_cache(
  async (): Promise<CategorySummary[]> => {
    await db();

    const [categories, counts] = await Promise.all([
      Category.find({ isActive: true })
        .select("name slug tagline description thumbnail heroImage order")
        .sort({ order: 1 })
        .lean(),
      Package.aggregate<{ _id: string; count: number }>([
        { $match: { isActive: true } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),
    ]);

    const byId = new Map(counts.map((row) => [String(row._id), row.count]));

    return leanJson(
      categories.map((category) => ({
        _id: String(category._id),
        name: category.name,
        slug: category.slug,
        tagline: category.tagline ?? undefined,
        description: category.description ?? undefined,
        thumbnail: pickImage(category.thumbnail),
        heroImage: pickImage(category.heroImage),
        packageCount: byId.get(String(category._id)) ?? 0,
      })),
    );
  },
  ["destinations-list"],
  { tags: [TAGS.categories, TAGS.packages], revalidate: REVALIDATE_SECONDS },
);

export type CategoryPackageCard = {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  destination?: string;
  days: number;
  nights: number;
  priceFrom: number;
  coverImage: Image;
  badge: "bestSeller" | "newJourney" | "none";
};

export type CategoryWithPackages = {
  category: CategoryDetail;
  packages: CategoryPackageCard[];
};

/**
 * One category plus the active packages under it. Returns null for an
 * unknown or inactive slug — the page turns that into a 404, never an
 * empty-but-200 page.
 */
export const getCategoryBySlug = (slug: string) =>
  unstable_cache(
    async (): Promise<CategoryWithPackages | null> => {
      await db();

      const category = await Category.findOne({ slug, isActive: true })
        .select("name slug tagline description thumbnail heroImage seo")
        .lean();

      if (!category) return null;

      const packages = await Package.find({
        category: category._id,
        isActive: true,
      })
        .select("title slug summary destination days nights priceFrom coverImage badge")
        .sort({ order: 1 })
        .lean();

      return leanJson({
        category: {
          _id: String(category._id),
          name: category.name,
          slug: category.slug,
          tagline: category.tagline ?? undefined,
          description: category.description ?? undefined,
          thumbnail: pickImage(category.thumbnail),
          heroImage: pickImage(category.heroImage),
          seo: category.seo ?? undefined,
          packageCount: packages.length,
        },
        packages: packages.map((pkg) => ({
          _id: String(pkg._id),
          title: pkg.title,
          slug: pkg.slug,
          summary: pkg.summary,
          destination: pkg.destination ?? undefined,
          days: pkg.days,
          nights: pkg.nights,
          priceFrom: pkg.priceFrom,
          coverImage: pickImage(pkg.coverImage)!,
          badge: pkg.badge,
        })),
      });
    },
    ["destination-detail", slug],
    {
      tags: [TAGS.categories, TAGS.category(slug), TAGS.packages],
      revalidate: REVALIDATE_SECONDS,
    },
  )();

/** Slugs for generateStaticParams — active categories only. */
export async function getAllCategorySlugs(): Promise<SlugEntry[]> {
  await db();
  const categories = await Category.find({ isActive: true })
    .select("slug updatedAt")
    .lean();
  return categories.map((category) => ({
    slug: category.slug,
    updatedAt: category.updatedAt,
  }));
}
