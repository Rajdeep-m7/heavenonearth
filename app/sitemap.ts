import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";
import { regions } from "@/lib/data/regions";
import { journeys } from "@/lib/data/journeys";
import { homestays } from "@/lib/data/homestays";
import { trendingDestinations } from "@/lib/data/trending";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = ([
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/destinations"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/homestays"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/packages"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/reviews"), changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/travel-styles"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/contact"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/privacy-policy"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/terms-of-service"), changeFrequency: "yearly", priority: 0.3 },
  ] satisfies MetadataRoute.Sitemap).map((route) => ({ ...route, lastModified }));

  const destinationSlugs = new Set([
    ...regions.map((region) => region.slug),
    ...Object.values(trendingDestinations)
      .flat()
      .map((destination) => destination.slug),
  ]);

  const destinationRoutes: MetadataRoute.Sitemap = [...destinationSlugs].map(
    (slug) => ({
      url: absoluteUrl(`/destinations/${slug}`),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    }),
  );

  const packageRoutes: MetadataRoute.Sitemap = journeys.map((journey) => ({
    url: absoluteUrl(`/packages/${journey.slug}`),
    lastModified,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const homestayRoutes: MetadataRoute.Sitemap = homestays.map((stay) => ({
    url: absoluteUrl(`/homestays/${stay.slug}`),
    lastModified,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...destinationRoutes,
    ...packageRoutes,
    ...homestayRoutes,
  ];
}
