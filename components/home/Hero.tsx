import Image from "next/image";
import Link from "next/link";

import { SocialRail } from "@/components/home/SocialRail";
import { SearchPanel } from "@/components/home/SearchPanel";
import { ArrowRight, Phone } from "@/components/ui/Icons";
import { siteConfig } from "@/lib/site";

const trustAvatars = [
  { src: "/images/avatar-1.jpg", alt: "" },
  { src: "/images/avatar-2.jpg", alt: "" },
  { src: "/images/avatar-3.jpg", alt: "" },
];

type HeroProps = {
  rating: { value: number; count: number } | null;
};

export function Hero({ rating }: HeroProps) {
  // Falls back to the configured headline figure until reviews exist.
  const trusted = rating
    ? `${rating.count.toLocaleString("en-IN")}+`
    : siteConfig.trustedBy;

  return (
    <section aria-labelledby="hero-heading" className="relative">
      <div className="relative min-h-[640px] overflow-hidden sm:min-h-[720px] lg:min-h-[804px]">
        {/* LCP image — eager, high priority, no lazy boundary. */}
        <Image
          src="/images/hero-darjeeling.jpg"
          alt="Tea slopes and colourful hill houses above a winding mountain road in Darjeeling, with the Himalaya beyond"
          fill
          priority
          fetchPriority="high"
          quality={82}
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* Legibility scrims, kept subtle so the photograph still reads. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/25 to-transparent"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/60 to-transparent"
        />

        <div className="relative mx-auto flex min-h-[640px] max-w-[1400px] flex-col justify-center px-6 pb-40 pt-32 sm:min-h-[720px] sm:px-10 sm:pb-44 lg:min-h-[804px] lg:pb-36">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/45 bg-white/12 py-2 pl-2 pr-5 backdrop-blur-md">
              <div className="flex -space-x-2.5">
                {trustAvatars.map((avatar) => (
                  <Image
                    key={avatar.src}
                    src={avatar.src}
                    alt={avatar.alt}
                    width={64}
                    height={64}
                    sizes="34px"
                    className="size-[34px] rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              <p className="text-[15px] text-white">
                Trusted by{" "}
                <span className="font-semibold text-gold">{trusted}</span>{" "}
                users.
              </p>
            </div>

            <p className="mt-8 text-[13px] font-medium uppercase tracking-eyebrow text-white sm:text-sm">
              Your Journey.{" "}
              <span className="text-gold">Our Local Expertise.</span>
            </p>

            <h1
              id="hero-heading"
              className="mt-5 font-display text-[clamp(2.6rem,7vw,4.2rem)] font-semibold leading-[1.06] text-white text-balance"
            >
              Find Your Own
              <br />
              Piece of Heaven.
            </h1>

            <p className="mt-4 font-display text-xl italic text-gold sm:text-[22px]">
              The Himalayas
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
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

        <SocialRail />
      </div>

      <SearchPanel />
    </section>
  );
}
