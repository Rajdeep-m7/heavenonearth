import "server-only";

import { unstable_cache } from "next/cache";

import { REVALIDATE_SECONDS, TAGS } from "@/lib/cache";
import { db } from "@/lib/db/connect";
import { Category, Package, Review, aggregateRating } from "@/lib/db/models";
import { leanJson, pickImage, type Image, type Seo } from "@/lib/db/shared";
import type { SlugEntry } from "@/lib/queries/destinations";

export type PackageCard = {
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
  category: { name: string; slug: string } | null;
};

const PAGE_SIZE = 12;

/**
 * The `/packages` listing, optionally filtered by category slug. Cache key
 * includes both, so each filter combination + page is its own cached entry —
 * a visitor browsing "Hill" packages never triggers a query for "all".
 */
export const getPackagesList = (categorySlug: string | undefined, page: number) =>
  unstable_cache(
    async (): Promise<{ packages: PackageCard[]; total: number; pages: number }> => {
      await db();

      const filter: Record<string, unknown> = { isActive: true };

      if (categorySlug) {
        const category = await Category.findOne({ slug: categorySlug })
          .select("_id")
          .lean();
        if (!category) return { packages: [], total: 0, pages: 0 };
        filter.category = category._id;
      }

      const [packages, total] = await Promise.all([
        Package.find(filter)
          .select("title slug summary destination days nights priceFrom coverImage badge")
          .populate("category", "name slug")
          .sort({ order: 1, createdAt: -1 })
          .skip((page - 1) * PAGE_SIZE)
          .limit(PAGE_SIZE)
          .lean(),
        Package.countDocuments(filter),
      ]);

      return leanJson({
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
          category: pkg.category
            ? { name: (pkg.category as any).name, slug: (pkg.category as any).slug }
            : null,
        })),
        total,
        pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      });
    },
    ["packages-list", categorySlug ?? "all", String(page)],
    { tags: [TAGS.packages, TAGS.categories], revalidate: REVALIDATE_SECONDS },
  )();

export type PackageDetail = {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  description?: string;
  destination?: string;
  days: number;
  nights: number;
  duration: string;
  priceFrom: number;
  currency: string;
  inclusions: string[];
  exclusions: string[];
  itinerary: { day: number; title: string; detail?: string }[];
  coverImage: Image;
  images: Image[];
  badge: "bestSeller" | "newJourney" | "none";
  category: { name: string; slug: string } | null;
  seo?: Seo;
};

export type PackageReview = {
  _id: string;
  author: string;
  quote: string;
  rating: number;
  trip?: string;
  avatar?: Image;
  publishedAt?: string;
};

export type PackagePageData = {
  pkg: PackageDetail;
  reviews: PackageReview[];
  rating: { value: number; count: number } | null;
};

/** Full package detail + its approved reviews + aggregate rating. */
export const getPackageBySlug = (slug: string) =>
  unstable_cache(
    async (): Promise<PackagePageData | null> => {
      await db();

      const pkg = await Package.findOne({ slug, isActive: true })
        .populate("category", "name slug")
        .lean();

      if (!pkg) return null;

      const [reviews, rating] = await Promise.all([
        Review.find({ package: pkg._id, status: "approved" })
          .select("author quote rating trip avatar publishedAt")
          .sort({ publishedAt: -1 })
          .limit(12)
          .lean(),
        aggregateRating({ package: pkg._id }),
      ]);

      return leanJson({
        pkg: {
          _id: String(pkg._id),
          title: pkg.title,
          slug: pkg.slug,
          summary: pkg.summary,
          description: pkg.description ?? undefined,
          destination: pkg.destination ?? undefined,
          days: pkg.days,
          nights: pkg.nights,
          duration: `${pkg.days} Days / ${pkg.nights} Nights`,
          priceFrom: pkg.priceFrom,
          currency: pkg.currency,
          inclusions: pkg.inclusions ?? [],
          exclusions: pkg.exclusions ?? [],
          itinerary: (pkg.itinerary ?? []).map((day) => ({
            day: day.day,
            title: day.title,
            detail: day.detail ?? undefined,
          })),
          coverImage: pickImage(pkg.coverImage)!,
          images: (pkg.images ?? []).map((image) => pickImage(image)!),
          badge: pkg.badge,
          category: pkg.category
            ? { name: (pkg.category as any).name, slug: (pkg.category as any).slug }
            : null,
          seo: pkg.seo ?? undefined,
        },
        reviews: reviews.map((review) => ({
          _id: String(review._id),
          author: review.author,
          quote: review.quote,
          rating: review.rating,
          trip: review.trip ?? undefined,
          avatar: pickImage(review.avatar),
          publishedAt: review.publishedAt?.toISOString(),
        })),
        rating,
      });
    },
    ["package-detail", slug],
    {
      tags: [TAGS.packages, TAGS.package(slug), TAGS.reviews],
      revalidate: REVALIDATE_SECONDS,
    },
  )();

/** Slugs for generateStaticParams — active packages only. */
export async function getAllPackageSlugs(): Promise<SlugEntry[]> {
  await db();
  const packages = await Package.find({ isActive: true })
    .select("slug updatedAt")
    .lean();
  return packages.map((pkg) => ({ slug: pkg.slug, updatedAt: pkg.updatedAt }));
}
