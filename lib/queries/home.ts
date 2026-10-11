import "server-only";

import { unstable_cache } from "next/cache";

import { REVALIDATE_SECONDS, TAGS } from "@/lib/cache";
import { db } from "@/lib/db/connect";
import { hasDatabase } from "@/lib/env";
import { Category, GalleryItem, Package, Review, Stay, aggregateRating } from "@/lib/db/models";

import { regions as fixtureRegions } from "@/lib/data/regions";
import { journeys as fixtureJourneys } from "@/lib/data/journeys";
import { homestays as fixtureHomestays } from "@/lib/data/homestays";
import { testimonials as fixtureTestimonials } from "@/lib/data/testimonials";

/**
 * View models. The section components take these shapes, so swapping the
 * source (fixtures now, Atlas once seeded) changes nothing above this layer.
 */

export type RegionView = {
  slug: string;
  name: string;
  blurb: string;
  image: string;
  alt: string;
  badge?: string;
};

export type JourneyView = {
  slug: string;
  title: string;
  titleLines: string[];
  quote: string;
  duration: string;
  priceFrom: number;
  inclusions: string[];
  image: string;
  alt: string;
  badge: string;
  badgeTone: "light" | "gold";
  cardTone: "white" | "ice";
};

export type StayView = {
  slug: string;
  name: string;
  blurb: string;
  image: string;
  alt: string;
  location: string;
  priceFrom?: number;
};

export type TestimonialView = {
  id: string;
  quote: string;
  author: string;
  trip: string;
  date: string;
  datePublished: string;
  rating: 5;
  avatar: string;
};

export type HomeData = {
  regions: RegionView[];
  journeys: JourneyView[];
  stays: StayView[];
  testimonials: TestimonialView[];
  rating: { value: number; count: number } | null;
  /** True when the fixtures are being used because the DB is unavailable. */
  usingFixtures: boolean;
};

/* ------------------------------------------------------------------ */
/* Mappers                                                             */
/* ------------------------------------------------------------------ */

const BADGE_LABEL: Record<string, string> = {
  bestSeller: "Best Seller",
  newJourney: "New Journey",
  none: "",
};

/** Splits a long title across three lines the way the design lays it out. */
function toTitleLines(title: string): string[] {
  const words = title.split(" ");
  if (words.length <= 3) return [title];
  const perLine = Math.ceil(words.length / 3);
  return [
    words.slice(0, perLine).join(" "),
    words.slice(perLine, perLine * 2).join(" "),
    words.slice(perLine * 2).join(" "),
  ].filter(Boolean);
}

const monthYear = (date: Date | string) =>
  new Date(date).toLocaleDateString("en-IN", { month: "short", year: "numeric" });

/* ------------------------------------------------------------------ */
/* The fixture fallback                                                */
/* ------------------------------------------------------------------ */

function fixtureData(): HomeData {
  return {
    regions: fixtureRegions,
    journeys: fixtureJourneys.map((journey) => ({
      slug: journey.slug,
      title: journey.title,
      titleLines: journey.titleLines,
      quote: journey.quote,
      duration: journey.duration,
      priceFrom: journey.priceFrom,
      inclusions: journey.inclusions,
      image: journey.image,
      alt: journey.alt,
      badge: journey.badge,
      badgeTone: journey.badgeTone,
      cardTone: journey.cardTone,
    })),
    stays: fixtureHomestays.map((stay) => ({
      slug: stay.slug,
      name: stay.name,
      blurb: stay.blurb,
      image: stay.image,
      alt: stay.alt,
      location: stay.location,
    })),
    testimonials: fixtureTestimonials,
    rating: null,
    usingFixtures: true,
  };
}

/* ------------------------------------------------------------------ */
/* The real query — one round trip for the whole page                  */
/* ------------------------------------------------------------------ */

async function fetchHomeData(): Promise<HomeData> {
  await db();

  // Everything in parallel: five small, indexed, projected reads.
  const [categories, journeys, stays, reviews, rating] = await Promise.all([
    Category.find({ isActive: true })
      .select("name slug tagline description thumbnail icon")
      .sort({ order: 1 })
      .limit(6)
      .lean(),

    Package.find({ isActive: true, isFeatured: true })
      .select("title slug summary days nights priceFrom inclusions coverImage badge")
      .sort({ order: 1 })
      .limit(2)
      .lean(),

    Stay.find({ isActive: true, isFeatured: true })
      .select("name slug summary coverImage location priceFrom")
      .sort({ order: 1 })
      .limit(6)
      .lean(),

    // Featured reviews lead, but any approved review qualifies: an admin who
    // approves a review expects to see it on the home page, and requiring a
    // separate "featured" flag left the section nearly empty.
    Review.find({ status: "approved" })
      .select("author quote trip rating avatar publishedAt createdAt")
      .sort({ isFeatured: -1, publishedAt: -1 })
      .limit(8)
      .lean(),

    aggregateRating(),
  ]);

  return {
    regions: categories.map((category) => ({
      slug: category.slug,
      name: category.name,
      blurb: category.tagline || category.description?.slice(0, 160) || "",
      image: category.thumbnail?.publicId ?? category.thumbnail?.url ?? "",
      alt: category.thumbnail?.alt ?? category.name,
    })),

    journeys: journeys.map((journey, index) => ({
      slug: journey.slug,
      title: journey.title,
      titleLines: toTitleLines(journey.title),
      quote: journey.summary,
      duration: `${journey.days} Days / ${journey.nights} Nights`,
      priceFrom: journey.priceFrom,
      inclusions: journey.inclusions ?? [],
      image: journey.coverImage?.publicId ?? journey.coverImage?.url ?? "",
      alt: journey.coverImage?.alt ?? journey.title,
      badge: BADGE_LABEL[journey.badge ?? "none"] || "Featured",
      badgeTone: journey.badge === "newJourney" ? "gold" : "light",
      // Alternating card tint, as in the design.
      cardTone: index % 2 === 0 ? "white" : "ice",
    })),

    stays: stays.map((stay) => ({
      slug: stay.slug,
      name: stay.name,
      blurb: stay.summary,
      image: stay.coverImage?.publicId ?? stay.coverImage?.url ?? "",
      alt: stay.coverImage?.alt ?? stay.name,
      location: [stay.location?.locality, stay.location?.region]
        .filter(Boolean)
        .join(", "),
      priceFrom: stay.priceFrom || undefined,
    })),

    testimonials: reviews.map((review) => ({
      id: String(review._id),
      quote: review.quote,
      author: review.author,
      trip: review.trip ?? "",
      date: monthYear(review.publishedAt ?? review.createdAt),
      datePublished: new Date(review.publishedAt ?? review.createdAt)
        .toISOString()
        .slice(0, 10),
      rating: 5 as const,
      avatar: review.avatar?.publicId ?? review.avatar?.url ?? "",
    })),

    rating,
    usingFixtures: false,
  };
}

/**
 * Cached for an hour and tagged, so a visitor costs zero database reads until
 * an admin saves something or the window lapses.
 *
 * If the database is not configured, or a query fails, the page falls back to
 * the design fixtures rather than 500-ing. That keeps the site renderable
 * before Atlas is wired up — and after seeding, `usingFixtures` is false.
 */
export const getHomeData = unstable_cache(
  async (): Promise<HomeData> => {
    if (!hasDatabase()) return fixtureData();

    try {
      const data = await fetchHomeData();
      // An empty database is not an error — it just has nothing to show yet.
      if (data.regions.length === 0 && data.journeys.length === 0) {
        return fixtureData();
      }
      return data;
    } catch (error) {
      // unstable_cache stores whatever we return, so a fixture fallback here would
      // pin placeholder content for the full hour after one transient blip. In
      // production, throw instead: nothing is cached, and ISR keeps serving the
      // last good page until the next revalidation succeeds.
      if (process.env.NODE_ENV === "production") throw error;
      console.error("[home] falling back to fixtures:", error);
      return fixtureData();
    }
  },
  ["home-data"],
  {
    tags: [TAGS.home, TAGS.categories, TAGS.packages, TAGS.stays, TAGS.reviews],
    revalidate: REVALIDATE_SECONDS,
  },
);
