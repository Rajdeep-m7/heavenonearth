import Image from "next/image";
import Link from "next/link";

import { Rail } from "@/components/ui/Rail";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRight } from "@/components/ui/Icons";
import type { StayView } from "@/lib/queries/home";

export function HomestaysSection({ stays }: { stays: StayView[] }) {
  if (stays.length === 0) return null;

  return (
    <section
      id="homestays"
      aria-labelledby="homestays-heading"
      className="bg-white py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <h2
            id="homestays-heading"
            className="font-display text-[clamp(2.1rem,5.5vw,3.7rem)] font-bold leading-tight text-ink"
          >
            Stay Like You Belong Here
          </h2>
          <Link
            href="/homestays"
            className="group inline-flex w-fit shrink-0 items-center gap-3 rounded-full bg-teal px-9 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-teal-deep"
          >
            View Stay
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <Reveal delay={120} className="mt-14 lg:mt-16">
          <Rail label="Featured homestays" tone="teal" className="gap-6 pb-4 lg:gap-8">
            {stays.map((stay) => (
              <article
                key={stay.slug}
                className="group w-[min(84vw,380px)] shrink-0 snap-start lg:w-[calc((100%-4rem)/3)]"
              >
                <div className="relative aspect-[400/278] overflow-hidden rounded-xl">
                  <Image
                    src={stay.image}
                    alt={stay.alt}
                    fill
                    sizes="(max-width: 640px) 84vw, (max-width: 1024px) 45vw, 380px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="border-l-2 border-transparent pl-0 pt-6 transition-colors duration-500 group-hover:border-gold group-hover:pl-6">
                  <h3 className="font-display text-[26px] font-medium text-charcoal">
                    {stay.name}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-slate">
                    {stay.blurb}
                  </p>
                  <p className="mt-2 text-[13px] font-medium uppercase tracking-[0.12em] text-slate/80">
                    {stay.location}
                  </p>

                  <Link
                    href={`/homestays/${stay.slug}`}
                    className="mt-5 inline-flex items-center gap-2.5 text-[13px] font-semibold uppercase tracking-[0.16em] text-teal-deep transition hover:text-ink"
                  >
                    Explore
                    <span className="sr-only"> — {stay.name}</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1.5" />
                  </Link>
                </div>
              </article>
            ))}
          </Rail>
        </Reveal>
      </div>
    </section>
  );
}
