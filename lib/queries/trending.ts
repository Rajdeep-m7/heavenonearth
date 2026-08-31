import "server-only";

import { unstable_cache } from "next/cache";
import { REVALIDATE_SECONDS, TAGS } from "@/lib/cache";
import { db } from "@/lib/db/connect";
import { Trending } from "@/lib/db/models";
import { hasDatabase } from "@/lib/env";
import { trendingDestinations as fixtureTrending } from "@/lib/data/trending";

export type TrendingTab = "international" | "india";

export type TrendingDestination = {
  _id: string;
  slug: string;
  name: string;
  style: "caps" | "italic" | "title";
  image: string;
  alt: string;
};

export type TrendingData = Record<TrendingTab, TrendingDestination[]>;

async function fetchTrendingData(): Promise<TrendingData> {
  await db();

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
        name: item.name,
        style: item.style as "caps" | "italic" | "title",
        image: item.image?.url ?? "",
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
        international: fixtureTrending.international.map((t, i) => ({ ...t, _id: `fix-int-${i}` })),
        india: fixtureTrending.india.map((t, i) => ({ ...t, _id: `fix-ind-${i}` }))
      };
    }

    try {
      const data = await fetchTrendingData();
      if (data.international.length === 0 && data.india.length === 0) {
        return {
          international: fixtureTrending.international.map((t, i) => ({ ...t, _id: `fix-int-${i}` })),
          india: fixtureTrending.india.map((t, i) => ({ ...t, _id: `fix-ind-${i}` }))
        };
      }
      return data;
    } catch (error) {
      console.error("[trending] falling back to fixtures:", error);
      return {
        international: fixtureTrending.international.map((t, i) => ({ ...t, _id: `fix-int-${i}` })),
        india: fixtureTrending.india.map((t, i) => ({ ...t, _id: `fix-ind-${i}` }))
      };
    }
  },
  ["trending-data"],
  {
    tags: [TAGS.trending],
    revalidate: REVALIDATE_SECONDS,
  }
);
