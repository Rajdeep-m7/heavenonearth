import Image from "next/image";

import { HeroSlider } from "@/components/home/HeroSlider";
import { SocialRail } from "@/components/home/SocialRail";
import { SearchPanel } from "@/components/home/SearchPanel";
import type { HeroSlideData } from "@/lib/data/hero";
import { siteConfig } from "@/lib/site";

const trustAvatars = [
  { src: "/images/avatar-1.jpg", alt: "" },
  { src: "/images/avatar-2.jpg", alt: "" },
  { src: "/images/avatar-3.jpg", alt: "" },
];

type HeroProps = {
  rating: { value: number; count: number } | null;
  slides: HeroSlideData[];
};

export function Hero({ rating, slides }: HeroProps) {
  // Falls back to the configured headline figure until reviews exist.
  const trusted = rating
    ? `${rating.count.toLocaleString("en-IN")}+`
    : siteConfig.trustedBy;

  return (
    <section aria-labelledby="hero-heading" className="relative">
      <HeroSlider
        slides={slides}
        rail={<SocialRail />}
        badge={
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
        }
      />

      <SearchPanel />
    </section>
  );
}
