import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/ui/Reveal";
import { siteConfig } from "@/lib/site";

export function FinalCta() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="relative min-h-[560px] overflow-hidden sm:min-h-[640px] lg:min-h-[750px]"
    >
      <Image
        src="/images/cta-mountain-lake.jpg"
        alt="A still alpine lake mirroring snow-dusted peaks at dusk"
        fill
        quality={80}
        sizes="100vw"
        className="object-cover object-center"
      />
      <div aria-hidden className="absolute inset-0 bg-ink/50" />

      <div className="relative mx-auto flex min-h-[560px] max-w-[900px] flex-col items-center justify-center px-6 py-24 text-center sm:min-h-[640px] sm:px-10 lg:min-h-[750px]">
        <Reveal>
          <h2
            id="cta-heading"
            className="font-display text-[clamp(2.6rem,7.5vw,4.6rem)] font-medium leading-[1.08] text-white text-balance"
          >
            Ready for the
            <br />
            extraordinary?
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-white/90 sm:text-base text-pretty">
            Let our experts design a bespoke Himalayan journey that reflects
            your pace and passions.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-gold px-11 py-[18px] text-sm font-semibold uppercase tracking-[0.16em] text-ink shadow-lift transition hover:bg-gold-deep"
            >
              Start Planning
            </Link>
            <a
              href={`tel:${siteConfig.phone}`}
              className="inline-flex items-center justify-center rounded-full border border-white/70 px-9 py-[18px] text-[15px] font-semibold text-white transition hover:bg-white hover:text-ink"
            >
              Talk to an expert
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
