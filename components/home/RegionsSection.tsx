import Image from "next/image";
import Link from "next/link";

import { Rail } from "@/components/ui/Rail";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRight } from "@/components/ui/Icons";
import type { RegionView } from "@/lib/queries/home";

export function RegionsSection({ regions }: { regions: RegionView[] }) {
  if (regions.length === 0) return null;

  return (
    <section
      id="destinations"
      aria-labelledby="regions-heading"
      className="bg-mint pb-20 pt-24 sm:pb-24 lg:pb-28 lg:pt-32"
    >
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2
            id="regions-heading"
            className="font-display text-[clamp(2.1rem,5vw,3.5rem)] font-bold leading-tight text-ink text-balance"
          >
            Start Close. Go Far.
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-teal-deep text-pretty">
            Discover the hidden gems of West Bengal and beyond, curated for the
            modern traveler seeking authentic experiences.
          </p>
        </Reveal>

        <Reveal delay={120} className="mt-14 lg:mt-16">
          <Rail
            label="Featured regions"
            tone="gold"
            className="gap-6 pb-6 lg:gap-8"
          >
            {regions.map((region) => (
              <article
                key={region.slug}
                className="group flex w-[min(84vw,380px)] shrink-0 snap-start flex-col overflow-hidden rounded-[26px] bg-white shadow-card transition duration-500 hover:-translate-y-2 hover:shadow-lift lg:w-[calc((100%-4rem)/3)]"
              >
                <div className="relative aspect-[400/262] overflow-hidden">
                  <Image
                    src={region.image}
                    alt={region.alt}
                    fill
                    sizes="(max-width: 640px) 84vw, (max-width: 1024px) 45vw, 380px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {region.badge && (
                    <span className="absolute right-4 top-4 rounded-full bg-white/95 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink shadow-sm">
                      {region.badge}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-7">
                  <h3 className="font-display text-[26px] font-medium text-charcoal">
                    {region.name}
                  </h3>
                  <p className="mt-3 line-clamp-2 text-[15px] leading-relaxed text-slate">
                    {region.blurb}
                  </p>

                  <div className="mt-auto pt-7">
                    <div className="border-t border-black/10 pt-5">
                      <Link
                        href={`/destinations/${region.slug}`}
                        className="flex items-center justify-between text-[15px] font-medium text-teal-deep transition hover:text-ink"
                      >
                        <span>
                          Explore Region
                          <span className="sr-only"> — {region.name}</span>
                        </span>
                        <ArrowRight className="size-5 transition-transform group-hover:translate-x-1.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </Rail>
        </Reveal>

        <Reveal delay={200} className="mt-12 flex justify-center">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2.5 rounded-full border border-ink/70 px-9 py-4 text-[15px] font-medium text-ink transition hover:bg-ink hover:text-white"
          >
            View All Destinations
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
