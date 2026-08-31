import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";
import { hasDatabase } from "@/lib/env";
import { getAllCategorySlugs } from "@/lib/queries/destinations";
import { getAllPackageSlugs } from "@/lib/queries/packages";
import { getAllStaySlugs } from "@/lib/queries/stays";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticRoutes = (
    [
      { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
      { url: absoluteUrl("/destinations"), changeFrequency: "weekly", priority: 0.9 },
      { url: absoluteUrl("/packages"), changeFrequency: "weekly", priority: 0.9 },
      { url: absoluteUrl("/stays"), changeFrequency: "weekly", priority: 0.9 },
      { url: absoluteUrl("/gallery"), changeFrequency: "weekly", priority: 0.6 },
      { url: absoluteUrl("/reviews"), changeFrequency: "weekly", priority: 0.6 },
      { url: absoluteUrl("/flights"), changeFrequency: "monthly", priority: 0.6 },
      { url: absoluteUrl("/cars"), changeFrequency: "monthly", priority: 0.6 },
      { url: absoluteUrl("/trains"), changeFrequency: "monthly", priority: 0.6 },
      { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.5 },
      { url: absoluteUrl("/contact"), changeFrequency: "monthly", priority: 0.5 },
      { url: absoluteUrl("/privacy-policy"), changeFrequency: "yearly", priority: 0.2 },
      { url: absoluteUrl("/terms-of-service"), changeFrequency: "yearly", priority: 0.2 },
    ] satisfies MetadataRoute.Sitemap
  ).map((route) => ({ ...route, lastModified }));

  // No DB configured yet (e.g. a fresh checkout before .env.local is filled
  // in) — a sitemap with just the static routes is still valid.
  if (!hasDatabase()) return staticRoutes;

  const [categorySlugs, packageSlugs, staySlugs] = await Promise.all([
    getAllCategorySlugs(),
    getAllPackageSlugs(),
    getAllStaySlugs(),
  ]);

  const destinationRoutes: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: absoluteUrl(`/destinations/${slug}`),
    lastModified,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const packageRoutes: MetadataRoute.Sitemap = packageSlugs.map((slug) => ({
    url: absoluteUrl(`/packages/${slug}`),
    lastModified,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const stayRoutes: MetadataRoute.Sitemap = staySlugs.map((slug) => ({
    url: absoluteUrl(`/stays/${slug}`),
    lastModified,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...destinationRoutes, ...packageRoutes, ...stayRoutes];
}
