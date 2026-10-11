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
  trending: "trending",
  hero: "hero",
  offer: "offer",
  package: (slug: string) => `package:${slug}`,
  stay: (slug: string) => `stay:${slug}`,
  category: (slug: string) => `category:${slug}`,
} as const;

/** Hourly safety net behind tag-based revalidation. */
export const REVALIDATE_SECONDS = 3600;

export function bust(...tags: string[]) {
  // Next 16 requires a second argument here and treats it as a *cache-life
  // profile* — "max" means "keep this cached for a very long time," which is
  // the opposite of what an admin write needs. `{ expire: 0 }` is what
  // actually forces immediate invalidation (confirmed against Next's own
  // revalidateTag source: pathWasRevalidated is only set when the profile is
  // absent or its expire is exactly 0). Caught by testing the real approve
  // -> publish flow in a browser, not by reading the type signature.
  for (const tag of new Set(tags)) revalidateTag(tag, { expire: 0 });
}

/** Anything on the home page also busts the `home` tag. */
export const bustHome = (...tags: string[]) => bust(TAGS.home, ...tags);
