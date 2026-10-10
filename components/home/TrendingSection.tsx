"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Rail } from "@/components/ui/Rail";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowUpRight } from "@/components/ui/Icons";
import { type TrendingTab } from "@/lib/data/trending";
import { type TrendingData } from "@/lib/queries/trending";

const tabs: { id: TrendingTab; label: string }[] = [
  { id: "international", label: "International" },
  { id: "india", label: "India & Around" },
];

const nameStyles: Record<string, string> = {
  caps: "font-display text-[26px] font-semibold uppercase tracking-[0.06em] sm:text-[30px]",
  italic: "font-display text-[28px] font-semibold italic sm:text-[32px]",
  title: "font-display text-[28px] font-medium sm:text-[32px]",
};

export function TrendingSection({ data }: { data: TrendingData }) {
  const [tab, setTab] = useState<TrendingTab>("international");
  return (
    <section
      aria-labelledby="trending-heading"
      className="bg-cream py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <Reveal className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
          <h2
            id="trending-heading"
            className="font-display text-[clamp(2.1rem,5.5vw,3.7rem)] font-bold leading-tight text-ink"
          >
            Trending Destinations
          </h2>

          <div
            role="tablist"
            aria-label="Trending destination regions"
            className="inline-flex w-fit shrink-0 rounded-full bg-ice p-1.5"
          >
            {tabs.map((item) => {
              const selected = tab === item.id;
              return (
                <button
                  key={item.id}
                  role="tab"
                  type="button"
                  id={`trend-tab-${item.id}`}
                  aria-selected={selected}
                  aria-controls={`trend-panel-${item.id}`}
                  onClick={() => setTab(item.id)}
                  className={`rounded-full px-6 py-2.5 text-[15px] font-medium transition-all duration-300 sm:px-7 ${
                    selected
                      ? "bg-ink text-gold shadow-card"
                      : "text-teal-deep hover:text-ink"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Both panels are in the HTML so crawlers see every destination; the
            inactive one is only hidden, not unmounted. */}
        {tabs.map(({ id: panelId }) => (
        <div
          key={panelId}
          role="tabpanel"
          id={`trend-panel-${panelId}`}
          aria-labelledby={`trend-tab-${panelId}`}
          hidden={tab !== panelId}
          className="mt-14 lg:mt-16"
        >
          <Rail label="Trending destinations" tone="light" className="gap-6 pb-4 lg:gap-8">
            {data[panelId].map((destination, index) => (
              <Link
                key={`${panelId}-${destination.slug}`}
                href={`/destinations/${destination.slug}`}
                className="group relative w-[min(72vw,290px)] shrink-0 snap-start lg:w-[calc((100%-6rem)/4)]"
              >
                <Reveal delay={index * 90}>
                  <div className="mask-arch relative aspect-[290/421] overflow-hidden shadow-card ring-1 ring-black/5 transition duration-500 group-hover:-translate-y-2 group-hover:shadow-lift">
                    <Image
                      src={destination.image}
                      alt={destination.alt}
                      fill
                      sizes="(max-width: 640px) 72vw, (max-width: 1024px) 40vw, 290px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/25"
                    />
                    <h3
                      className={`absolute inset-x-4 top-8 text-center text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)] ${
                        nameStyles[destination.style]
                      }`}
                    >
                      {destination.name}
                    </h3>
                  </div>
                </Reveal>
              </Link>
            ))}
          </Rail>
        </div>
        ))}

        <Reveal delay={160} className="mt-12 flex justify-center">
          <Link
            href="/destinations"
            className="group inline-flex items-center gap-2.5 rounded-full bg-teal px-9 py-4 text-[15px] font-semibold text-white transition hover:bg-teal-deep"
          >
            Explore Now
            <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
