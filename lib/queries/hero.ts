import "server-only";

import { unstable_cache } from "next/cache";

import { REVALIDATE_SECONDS, TAGS } from "@/lib/cache";
import { db } from "@/lib/db/connect";
import { HeroSlide } from "@/lib/db/models";
import { defaultHeroSlides, type HeroSlideData } from "@/lib/data/hero";
import { hasDatabase } from "@/lib/env";

export type { HeroSlideData };

async function fetchHeroSlides(): Promise<HeroSlideData[]> {
  await db();

  const slides = await HeroSlide.find({ isActive: true })
    .select("image headline subheading ctaLabel ctaHref")
    .sort({ order: 1, createdAt: 1 })
    .limit(10)
    .lean();

  return slides.map((slide) => ({
    _id: String(slide._id),
    image: slide.image.publicId || slide.image.url,
    alt: slide.image.alt ?? "",
    headline: slide.headline,
    subheading: slide.subheading ?? "",
    ctaLabel: slide.ctaLabel ?? "",
    ctaHref: slide.ctaHref ?? "",
  }));
}

export const getHeroSlides = unstable_cache(
  async (): Promise<HeroSlideData[]> => {
    if (!hasDatabase()) return defaultHeroSlides;

    try {
      const slides = await fetchHeroSlides();
      return slides.length > 0 ? slides : defaultHeroSlides;
    } catch (error) {
      console.error("[hero] falling back to the default slide:", error);
      return defaultHeroSlides;
    }
  },
  ["hero-slides"],
  { tags: [TAGS.hero], revalidate: REVALIDATE_SECONDS },
);
