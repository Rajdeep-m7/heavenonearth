import "server-only";

import { unstable_cache } from "next/cache";

import { REVALIDATE_SECONDS, TAGS } from "@/lib/cache";
import { db } from "@/lib/db/connect";
import { Category, Review, Room, Stay, aggregateRating } from "@/lib/db/models";
import { leanJson, pickImage, type Image, type Seo } from "@/lib/db/shared";
import type { SlugEntry } from "@/lib/queries/destinations";

export type StayCard = {
  _id: string;
  name: string;
  slug: string;
  summary: string;
  propertyType: string;
  location: { locality?: string; region?: string };
  priceFrom: number;
  coverImage: Image;
  category: { name: string; slug: string } | null;
};

const PAGE_SIZE = 12;

/** The `/stays` listing, optionally filtered by category slug. */
export const getStaysList = (categorySlug: string | undefined, page: number) =>
  unstable_cache(
    async (): Promise<{ stays: StayCard[]; total: number; pages: number }> => {
      await db();

      const filter: Record<string, unknown> = { isActive: true };

      if (categorySlug) {
        const category = await Category.findOne({ slug: categorySlug })
          .select("_id")
          .lean();
        if (!category) return { stays: [], total: 0, pages: 0 };
        filter.category = category._id;
      }

      const [stays, total] = await Promise.all([
        Stay.find(filter)
          .select("name slug summary propertyType location priceFrom coverImage")
          .populate("category", "name slug")
          .sort({ order: 1, createdAt: -1 })
          .skip((page - 1) * PAGE_SIZE)
          .limit(PAGE_SIZE)
          .lean(),
        Stay.countDocuments(filter),
      ]);

      return leanJson({
        stays: stays.map((stay) => ({
          _id: String(stay._id),
          name: stay.name,
          slug: stay.slug,
          summary: stay.summary,
          propertyType: stay.propertyType,
          location: {
            locality: stay.location?.locality ?? undefined,
            region: stay.location?.region ?? undefined,
          },
          priceFrom: stay.priceFrom,
          coverImage: pickImage(stay.coverImage)!,
          category: stay.category
            ? { name: (stay.category as any).name, slug: (stay.category as any).slug }
            : null,
        })),
        total,
        pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      });
    },
    ["stays-list", categorySlug ?? "all", String(page)],
    { tags: [TAGS.stays, TAGS.categories], revalidate: REVALIDATE_SECONDS },
  )();

export type RoomCard = {
  _id: string;
  name: string;
  description?: string;
  maxAdults: number;
  maxChildren: number;
  bedType?: string;
  pricePerNight: number;
  amenities: string[];
  images: Image[];
};

export type StayDetail = {
  _id: string;
  name: string;
  slug: string;
  summary: string;
  description?: string;
  location: {
    address?: string;
    locality?: string;
    region?: string;
    country?: string;
    lat?: number;
    lng?: number;
  };
  propertyType: string;
  amenities: string[];
  houseRules: string[];
  cancellationPolicy?: string;
  checkInTime: string;
  checkOutTime: string;
  host?: { name?: string; bio?: string; avatar?: Image; tags: string[] };
  coverImage: Image;
  images: Image[];
  priceFrom: number;
  highlights: string[];
  category: { name: string; slug: string } | null;
  seo?: Seo;
};

export type StayReview = {
  _id: string;
  author: string;
  quote: string;
  rating: number;
  trip?: string;
  avatar?: Image;
  publishedAt?: string;
};

export type StayPageData = {
  stay: StayDetail;
  rooms: RoomCard[];
  reviews: StayReview[];
  rating: { value: number; count: number } | null;
};

/** Full stay detail + its active rooms + approved reviews + aggregate rating. */
export const getStayBySlug = (slug: string) =>
  unstable_cache(
    async (): Promise<StayPageData | null> => {
      await db();

      const stay = await Stay.findOne({ slug, isActive: true })
        .populate("category", "name slug")
        .lean();

      if (!stay) return null;

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

      return leanJson({
        stay: {
          _id: String(stay._id),
          name: stay.name,
          slug: stay.slug,
          summary: stay.summary,
          description: stay.description ?? undefined,
          location: {
            address: stay.location?.address ?? undefined,
            locality: stay.location?.locality ?? undefined,
            region: stay.location?.region ?? undefined,
            country: stay.location?.country ?? undefined,
            lat: stay.location?.lat ?? undefined,
            lng: stay.location?.lng ?? undefined,
          },
          propertyType: stay.propertyType,
          amenities: stay.amenities ?? [],
          houseRules: stay.houseRules ?? [],
          cancellationPolicy: stay.cancellationPolicy ?? undefined,
          checkInTime: stay.checkInTime,
          checkOutTime: stay.checkOutTime,
          host: stay.host
            ? {
                name: stay.host.name ?? undefined,
                bio: stay.host.bio ?? undefined,
                avatar: pickImage(stay.host.avatar),
                tags: stay.host.tags ?? [],
              }
            : undefined,
          coverImage: pickImage(stay.coverImage)!,
          images: (stay.images ?? []).map((image) => pickImage(image)!),
          priceFrom: stay.priceFrom,
          highlights: stay.highlights ?? [],
          category: stay.category
            ? { name: (stay.category as any).name, slug: (stay.category as any).slug }
            : null,
          seo: stay.seo ?? undefined,
        },
        rooms: rooms.map((room) => ({
          _id: String(room._id),
          name: room.name,
          description: room.description ?? undefined,
          maxAdults: room.maxAdults,
          maxChildren: room.maxChildren,
          bedType: room.bedType ?? undefined,
          pricePerNight: room.pricePerNight,
          amenities: room.amenities ?? [],
          images: (room.images ?? []).map((image) => pickImage(image)!),
        })),
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
    ["stay-detail", slug],
    {
      tags: [TAGS.stays, TAGS.stay(slug), TAGS.reviews],
      revalidate: REVALIDATE_SECONDS,
    },
  )();

/** Slugs for generateStaticParams — active stays only. */
export async function getAllStaySlugs(): Promise<SlugEntry[]> {
  await db();
  const stays = await Stay.find({ isActive: true }).select("slug updatedAt").lean();
  return stays.map((stay) => ({ slug: stay.slug, updatedAt: stay.updatedAt }));
}
