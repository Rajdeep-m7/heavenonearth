import Image from "next/image";
import Link from "next/link";

import { ArrowRight } from "@/components/ui/Icons";

type CardStay = {
  slug: string;
  name: string;
  summary: string;
  propertyType: string;
  location: { locality?: string; region?: string };
  priceFrom: number;
  coverImage: { publicId: string; url: string; alt: string };
  category?: { name: string; slug: string } | null;
};

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const PROPERTY_LABEL: Record<string, string> = {
  homestay: "Homestay",
  resort: "Resort",
  cottage: "Cottage",
  teaBungalow: "Tea Bungalow",
  camp: "Camp",
};

export function StayCard({ stay }: { stay: CardStay }) {
  const image = stay.coverImage?.publicId ?? stay.coverImage?.url ?? "";
  const place = [stay.location.locality, stay.location.region]
    .filter(Boolean)
    .join(", ");

  return (
    <Link
      href={`/stays/${stay.slug}`}
      className="group flex flex-col overflow-hidden rounded-[26px] bg-white shadow-card transition duration-500 hover:-translate-y-2 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-mint">
        {image && (
          <Image
            src={image}
            alt={stay.coverImage?.alt || stay.name}
            fill
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 380px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink shadow-sm">
          {PROPERTY_LABEL[stay.propertyType] ?? stay.propertyType}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-7">
        {place && (
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-teal-deep">
            {place}
          </p>
        )}
        <h3 className="mt-1.5 font-display text-[22px] font-semibold leading-snug text-charcoal">
          {stay.name}
        </h3>
        <p className="mt-2.5 line-clamp-2 text-[14px] leading-relaxed text-slate">
          {stay.summary}
        </p>

        <div className="mt-auto pt-6">
          <div className="flex items-center justify-between border-t border-black/10 pt-5">
            <div>
              <p className="text-[12px] uppercase tracking-[0.1em] text-slate">
                Starting From
              </p>
              <p className="mt-0.5 text-[15px] font-semibold text-teal">
                {stay.priceFrom > 0 ? inr.format(stay.priceFrom) : "Ask us"}
                {stay.priceFrom > 0 && (
                  <span className="text-[12px] font-medium text-slate"> / night</span>
                )}
              </p>
            </div>
            <ArrowRight className="size-5 shrink-0 text-teal-deep transition-transform group-hover:translate-x-1.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
