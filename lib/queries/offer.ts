import "server-only";

import { unstable_cache } from "next/cache";

import { REVALIDATE_SECONDS, TAGS } from "@/lib/cache";
import { db } from "@/lib/db/connect";
import { OfferPopup } from "@/lib/db/models";
import { hasDatabase } from "@/lib/env";

export type OfferPopupData = {
  /** Changes on every admin save, so an edited offer is shown again. */
  version: string;
  badge: string;
  title: string;
  description: string;
  image: { src: string; alt: string } | null;
  couponCode: string;
  ctaLabel: string;
  ctaHref: string;
  showOn: "home" | "all";
  frequency: "visit" | "session" | "day";
  delaySeconds: number;
  /** ISO strings. The window is checked in the browser — see OfferPopup. */
  startsAt: string | null;
  endsAt: string | null;
};

/**
 * The active offer, or null. The start/end window is deliberately *not*
 * applied here: this result is cached for up to an hour, so a server-side
 * check would let an expired offer linger (or a scheduled one arrive late).
 * The client compares the window against the visitor's clock instead.
 */
export const getOfferPopup = unstable_cache(
  async (): Promise<OfferPopupData | null> => {
    if (!hasDatabase()) return null;

    try {
      await db();
      const offer = await OfferPopup.findOne({ key: "main", isActive: true }).lean();
      if (!offer || !offer.title) return null;

      return {
        version: new Date(offer.updatedAt).toISOString(),
        badge: offer.badge ?? "",
        title: offer.title,
        description: offer.description ?? "",
        image: offer.image
          ? { src: offer.image.publicId || offer.image.url, alt: offer.image.alt ?? "" }
          : null,
        couponCode: offer.couponCode ?? "",
        ctaLabel: offer.ctaLabel ?? "",
        ctaHref: offer.ctaHref ?? "",
        showOn: offer.showOn === "all" ? "all" : "home",
        frequency:
          offer.frequency === "visit" || offer.frequency === "day"
            ? offer.frequency
            : "session",
        delaySeconds: offer.delaySeconds ?? 2,
        startsAt: offer.startsAt ? new Date(offer.startsAt).toISOString() : null,
        endsAt: offer.endsAt ? new Date(offer.endsAt).toISOString() : null,
      };
    } catch (error) {
      console.error("[offer] popup unavailable:", error);
      return null;
    }
  },
  ["offer-popup"],
  { tags: [TAGS.offer], revalidate: REVALIDATE_SECONDS },
);
