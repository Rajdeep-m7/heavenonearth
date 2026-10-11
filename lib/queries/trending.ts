import "server-only";

import { unstable_cache } from "next/cache";
import { REVALIDATE_SECONDS, TAGS } from "@/lib/cache";
import { db } from "@/lib/db/connect";
import { Category, Trending } from "@/lib/db/models";
import { hasDatabase } from "@/lib/env";
import { trendingDestinations as fixtureTrending } from "@/lib/data/trending";

export type TrendingTab = "international" | "india";

export type TrendingDestination = {
  _id: string;
  slug: string;
  /** Where the card links. Always a page that exists — never a 404. */
  href: string;
  name: string;
  style: "caps" | "italic" | "title";
  image: string;
  alt: string;
};

export type TrendingData = Record<TrendingTab, TrendingDestination[]>;

/**
 * A trending card is a place (Gangtok, Manali, Phuket...), but destination
 * pages exist per region. Cards whose own slug has no page link to the region
 * that contains them; anything with no region (Europe) goes to the index.
 */
const REGION_FOR: Record<string, string> = {
  gangtok: "sikkim",
  manali: "himachal-pradesh",
  phuket: "thailand",
  dubai: "uae",
  "uae-and-dubai": "uae",
  varanasi: "uttar-pradesh",
  "j-and-k": "jammu-and-kashmir",
  kashmir: "jammu-and-kashmir",
};

function resolveHref(slug: string, pages: Set<string>): string {
  if (pages.has(slug)) return `/destinations/${slug}`;
  const region = REGION_FOR[slug];
  if (region && pages.has(region)) return `/destinations/${region}`;
  return "/destinations";
}

async function fetchTrendingData(): Promise<TrendingData> {
  await db();

  const pages = new Set(
    (await Category.find({ isActive: true }).select("slug").lean()).map((c) => c.slug),
  );

  const items = await Trending.find({ isActive: true })
    .select("tab name slug style image order")
    .sort({ order: 1, createdAt: 1 })
    .lean();

  const result: TrendingData = {
    international: [],
    india: [],
  };

  for (const item of items) {
    if (item.tab === "international" || item.tab === "india") {
      result[item.tab].push({
        _id: String(item._id),
        slug: item.slug,
        href: resolveHref(item.slug, pages),
        name: item.name,
        style: item.style as "caps" | "italic" | "title",
        image: item.image?.publicId ?? item.image?.url ?? "",
        alt: item.image?.alt ?? item.name,
      });
    }
  }

  return result;
}

export const getTrendingData = unstable_cache(
  async (): Promise<TrendingData> => {
    if (!hasDatabase()) {
      return {
        international: fixtureTrending.international.map((t, i) => ({ ...t, _id: `fix-int-${i}`, href: `/destinations/${t.slug}` })),
        india: fixtureTrending.india.map((t, i) => ({ ...t, _id: `fix-ind-${i}`, href: `/destinations/${t.slug}` }))
      };
    }

    try {
      const data = await fetchTrendingData();
      if (data.international.length === 0 && data.india.length === 0) {
        return {
          international: fixtureTrending.international.map((t, i) => ({ ...t, _id: `fix-int-${i}`, href: `/destinations/${t.slug}` })),
          india: fixtureTrending.india.map((t, i) => ({ ...t, _id: `fix-ind-${i}`, href: `/destinations/${t.slug}` }))
        };
      }
      return data;
    } catch (error) {
      console.error("[trending] falling back to fixtures:", error);
      return {
        international: fixtureTrending.international.map((t, i) => ({ ...t, _id: `fix-int-${i}`, href: `/destinations/${t.slug}` })),
        india: fixtureTrending.india.map((t, i) => ({ ...t, _id: `fix-ind-${i}`, href: `/destinations/${t.slug}` }))
      };
    }
  },
  ["trending-data"],
  {
    tags: [TAGS.trending, TAGS.categories],
    revalidate: REVALIDATE_SECONDS,
  }
);
