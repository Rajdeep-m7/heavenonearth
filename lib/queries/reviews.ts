import "server-only";

import { unstable_cache } from "next/cache";

import { REVALIDATE_SECONDS, TAGS } from "@/lib/cache";
import { db } from "@/lib/db/connect";
import { Review, aggregateRating } from "@/lib/db/models";
import { leanJson, pickImage, type Image } from "@/lib/db/shared";

export type ReviewCardData = {
  _id: string;
  author: string;
  quote: string;
  rating: number;
  trip?: string;
  location?: string;
  avatar?: Image;
  publishedAt?: string;
};

const PAGE_SIZE = 18;

/** The `/reviews` page — every approved review, newest first. */
export const getApprovedReviews = (page: number) =>
  unstable_cache(
    async (): Promise<{
      reviews: ReviewCardData[];
      total: number;
      pages: number;
      rating: { value: number; count: number } | null;
    }> => {
      await db();

      const filter = { status: "approved" as const };

      const [reviews, total, rating] = await Promise.all([
        Review.find(filter)
          .select("author quote rating trip location avatar publishedAt createdAt")
          .sort({ publishedAt: -1, createdAt: -1 })
          .skip((page - 1) * PAGE_SIZE)
          .limit(PAGE_SIZE)
          .lean(),
        Review.countDocuments(filter),
        aggregateRating(),
      ]);

      return leanJson({
        reviews: reviews.map((review) => ({
          _id: String(review._id),
          author: review.author,
          quote: review.quote,
          rating: review.rating,
          trip: review.trip ?? undefined,
          location: review.location ?? undefined,
          avatar: pickImage(review.avatar),
          publishedAt: (review.publishedAt ?? review.createdAt)?.toISOString(),
        })),
        total,
        pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
        rating,
      });
    },
    ["reviews-list", String(page)],
    { tags: [TAGS.reviews], revalidate: REVALIDATE_SECONDS },
  )();
