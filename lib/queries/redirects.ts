import "server-only";

import { permanentRedirect } from "next/navigation";

import { db } from "@/lib/db/connect";
import { Category, Package, Stay } from "@/lib/db/models";
import { findCurrentSlug } from "@/lib/db/slug";

const MODELS = {
  packages: Package,
  stays: Stay,
  destinations: Category,
} as const;

/**
 * Called when a slug matches nothing. If the record was renamed, answer 301 to
 * the new URL so inbound links and rankings carry over; otherwise return and
 * let the caller 404.
 */
export async function redirectIfRenamed(
  section: keyof typeof MODELS,
  slug: string,
) {
  await db();
  const current = await findCurrentSlug(MODELS[section], slug);
  if (current && current !== slug) permanentRedirect(`/${section}/${current}`);
}
