import { revalidateTag } from "next/cache";

/**
 * Public pages are static and refresh on write, not on read. These tags are the
 * contract between an admin mutation and the pages it invalidates.
 */
export const TAGS = {
  categories: "categories",
  packages: "packages",
  stays: "stays",
  reviews: "reviews",
  gallery: "gallery",
  home: "home",
  package: (slug: string) => `package:${slug}`,
  stay: (slug: string) => `stay:${slug}`,
  category: (slug: string) => `category:${slug}`,
} as const;

/** Hourly safety net behind tag-based revalidation. */
export const REVALIDATE_SECONDS = 3600;

export function bust(...tags: string[]) {
  for (const tag of new Set(tags)) revalidateTag(tag, "max");
}

/** Anything on the home page also busts the `home` tag. */
export const bustHome = (...tags: string[]) => bust(TAGS.home, ...tags);
