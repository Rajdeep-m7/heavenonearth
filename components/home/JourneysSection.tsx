import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/ui/Reveal";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Star,
} from "@/components/ui/Icons";
import type { JourneyView } from "@/lib/queries/home";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function JourneysSection({ journeys }: { journeys: JourneyView[] }) {
  if (journeys.length === 0) return null;

  return (
    <section
      id="packages"
      aria-labelledby="journeys-heading"
      className="bg-mint py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <Reveal className="flex items-center justify-between gap-6">
          <h2
            id="journeys-heading"
            className="font-display text-[clamp(2.1rem,5.5vw,3.7rem)] font-bold leading-tight text-ink"
          >
            Journeys Made For You
          </h2>
          <Link
            href="/packages"
            aria-label="View all curated journeys"
            className="hidden size-14 shrink-0 place-items-center rounded-full text-ink transition hover:bg-ink hover:text-white sm:grid"
          >
            <ArrowRight className="size-7" />
          </Link>
        </Reveal>

        <div className="mt-14 grid gap-10 lg:mt-16 lg:grid-cols-2 lg:gap-12">
          {journeys.map((journey, index) => (
            <Reveal
              key={journey.slug}
              as="article"
              delay={index * 130}
              className="group relative"
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-[26px] shadow-card sm:aspect-[16/9]">
                <Image
                  src={journey.image}
                  alt={journey.alt}
                  fill
                  sizes="(max-width: 1024px) 92vw, 640px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />

                <span
                  className={`absolute top-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] shadow-sm ${
                    journey.badgeTone === "gold"
                      ? "right-5 bg-gold text-ink"
                      : "left-5 bg-white/95 text-ink"
                  }`}
                >
                  {journey.badgeTone === "gold" ? (
                    <BadgeCheck className="size-4" />
                  ) : (
                    <Star className="size-3.5 text-gold-deep" />
                  )}
                  {journey.badge}
                </span>
              </div>

              {/* Detail card overlapping the photo, as in the design. */}
              <div
                className={`relative z-10 -mt-16 ml-4 rounded-[26px] p-7 shadow-lift sm:-mt-20 sm:ml-8 sm:p-9 ${
                  journey.cardTone === "ice" ? "bg-ice" : "bg-white"
                }`}
              >
                <h3 className="font-display text-[clamp(1.8rem,3.4vw,2.6rem)] font-bold uppercase leading-[1.08] tracking-[-0.01em] text-charcoal">
                  {journey.titleLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </h3>

                <p className="mt-5 text-[15px] italic leading-relaxed text-slate">
                  &ldquo;{journey.quote}&rdquo;
                </p>

                <dl className="mt-7 flex divide-x divide-black/10 border-t border-black/10 pt-6">
                  <div className="pr-8">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate">
                      Duration
                    </dt>
                    <dd className="mt-2 text-[15px] font-semibold uppercase tracking-wide text-charcoal">
                      {journey.duration}
                    </dd>
                  </div>
                  <div className="pl-8">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate">
                      Starting From
                    </dt>
                    <dd className="mt-2 text-[15px] font-semibold text-teal">
                      {inr.format(journey.priceFrom)}{" "}
                      <span className="font-medium">/ person</span>
                    </dd>
                  </div>
                </dl>

                <div className="mt-6 border-t border-black/10 pt-6">
                  <h4 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate">
                    Inclusions
                  </h4>
                  <ul className="mt-3.5 flex flex-wrap gap-x-6 gap-y-2.5">
                    {journey.inclusions.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-[15px] text-charcoal"
                      >
                        <Check className="size-4 text-teal" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={`/packages/${journey.slug}`}
                  className="mt-8 inline-flex items-center gap-2.5 text-[15px] font-semibold text-teal-deep transition hover:text-ink"
                >
                  Explore Journey
                  <span className="sr-only"> — {journey.title}</span>
                  <ArrowRight className="size-5 transition-transform group-hover:translate-x-1.5" />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200} className="mt-16 flex justify-center">
          <Link
            href="/packages"
            className="group inline-flex items-center gap-3 rounded-full bg-teal px-10 py-[18px] text-sm font-semibold uppercase tracking-[0.14em] text-gold transition hover:bg-teal-deep"
          >
            View All Packages
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
