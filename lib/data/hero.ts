export type HeroSlideData = {
  _id: string;
  /** Cloudinary publicId, or a local /images/... path. */
  image: string;
  alt: string;
  /** A newline in the headline becomes a line break. */
  headline: string;
  subheading: string;
  ctaLabel: string;
  ctaHref: string;
};

/**
 * Shown until an admin publishes a slide of their own — and whenever the
 * database is unreachable — so the home page is never without a banner.
 */
export const defaultHeroSlides: HeroSlideData[] = [
  {
    _id: "fixture-hero-0",
    // 5810px original, served sharp at any width. The old bundled
    // /images/hero-darjeeling.jpg was only 1376px and looked soft once stretched.
    image:
      "https://images.unsplash.com/photo-1662551392187-768334a36d4e?auto=format&fit=crop&q=85&w=2400",
    alt: "The snow-capped Kanchenjunga range rising above a dark pine forest near Darjeeling under a clear blue sky",
    headline: "Find Your Own\nPiece of Heaven.",
    subheading: "The Himalayas",
    ctaLabel: "Explore Destinations",
    ctaHref: "/destinations",
  },
];
