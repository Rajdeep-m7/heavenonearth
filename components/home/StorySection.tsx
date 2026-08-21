import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/ui/Reveal";
import { ArrowRight, BadgeCheck, Phone } from "@/components/ui/Icons";
import { siteConfig } from "@/lib/site";

export function StorySection() {
  return (
    <section aria-labelledby="story-heading" className="relative isolate">
      {/* The registration badge straddles the top edge of the photo band. */}
      <Reveal className="relative z-20 flex justify-center">
        <p className="-mb-7 inline-flex items-center gap-3 rounded-full bg-gold py-3 pl-3 pr-7 text-[13px] font-semibold uppercase tracking-[0.16em] text-ink shadow-lift">
          <span className="grid size-8 place-items-center rounded-full bg-ink/90 text-gold">
            <BadgeCheck className="size-5" />
          </span>
          Government Registration
        </p>
      </Reveal>

      <div className="relative min-h-[560px] overflow-hidden sm:min-h-[640px] lg:min-h-[808px]">
        <Image
          src="/images/story-longtail-boat.jpg"
          alt="A wooden long-tail boat resting on still turquoise water beneath limestone cliffs at sunset"
          fill
          quality={80}
          sizes="100vw"
          className="object-cover object-center"
        />
        <div aria-hidden className="absolute inset-0 bg-ink/45" />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-ink/70 to-transparent"
        />

        <div className="relative mx-auto flex min-h-[560px] max-w-[1000px] flex-col items-center justify-center px-6 py-24 text-center sm:min-h-[640px] sm:px-10 lg:min-h-[808px]">
          <p className="font-display text-[clamp(3rem,9vw,5.6rem)] font-bold uppercase leading-none tracking-[0.02em] text-white">
            Our Story
          </p>

          <h2
            id="story-heading"
            className="mt-4 font-display text-[clamp(1.7rem,4.4vw,3.2rem)] font-semibold leading-tight text-gold text-balance"
          >
            We Believe The Best Journeys Feel Personal.
          </h2>

          <p className="mt-6 max-w-3xl text-[15px] leading-relaxed text-white/90 sm:text-base text-pretty">
            From Himalayan escapes and peaceful homestays to carefully planned
            journeys across Eastern India, we help you travel with local
            knowledge, personal attention, and a little more soul.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/destinations"
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-teal px-9 py-[18px] text-sm font-semibold uppercase tracking-[0.14em] text-white shadow-lift transition hover:bg-teal-deep"
            >
              Explore Destinations
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <a
              href={`tel:${siteConfig.phone}`}
              className="group inline-flex items-center justify-center gap-3 rounded-full border border-white/70 px-8 py-[18px] text-[17px] font-semibold text-white backdrop-blur-sm transition hover:bg-white hover:text-ink"
            >
              <Phone className="size-[18px]" />
              {siteConfig.phoneDisplay}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
