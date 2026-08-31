import Image from "next/image";
import Link from "next/link";

import { ArrowRight, BadgeCheck, Star } from "@/components/ui/Icons";

type CardPackage = {
  slug: string;
  title: string;
  summary: string;
  destination?: string;
  days: number;
  nights: number;
  priceFrom: number;
  coverImage: { publicId: string; url: string; alt: string };
  badge: "bestSeller" | "newJourney" | "none";
  category?: { name: string; slug: string } | null;
};

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const BADGE_LABEL: Record<string, string> = {
  bestSeller: "Best Seller",
  newJourney: "New Journey",
};

export function PackageCard({ pkg }: { pkg: CardPackage }) {
  const image = pkg.coverImage?.publicId ?? pkg.coverImage?.url ?? "";

  return (
    <Link
      href={`/packages/${pkg.slug}`}
      className="group flex flex-col overflow-hidden rounded-[26px] bg-white shadow-card transition duration-500 hover:-translate-y-2 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-mint">
        {image && (
          <Image
            src={image}
            alt={pkg.coverImage?.alt || pkg.title}
            fill
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 380px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        {pkg.badge !== "none" && (
          <span
            className={`absolute top-4 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] shadow-sm ${
              pkg.badge === "newJourney"
                ? "right-4 bg-gold text-ink"
                : "left-4 bg-white/95 text-ink"
            }`}
          >
            {pkg.badge === "newJourney" ? (
              <BadgeCheck className="size-3.5" />
            ) : (
              <Star className="size-3 text-gold-deep" />
            )}
            {BADGE_LABEL[pkg.badge]}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-7">
        {pkg.category && (
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-teal-deep">
            {pkg.category.name}
          </p>
        )}
        <h3 className="mt-1.5 font-display text-[22px] font-semibold leading-snug text-charcoal">
          {pkg.title}
        </h3>
        <p className="mt-2.5 line-clamp-2 text-[14px] leading-relaxed text-slate">
          {pkg.summary}
        </p>

        <div className="mt-auto pt-6">
          <div className="flex items-center justify-between border-t border-black/10 pt-5">
            <div>
              <p className="text-[12px] uppercase tracking-[0.1em] text-slate">
                {pkg.days} Days / {pkg.nights} Nights
              </p>
              <p className="mt-0.5 text-[15px] font-semibold text-teal">
                {inr.format(pkg.priceFrom)}{" "}
                <span className="text-[12px] font-medium text-slate">/ person</span>
              </p>
            </div>
            <ArrowRight className="size-5 shrink-0 text-teal-deep transition-transform group-hover:translate-x-1.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
