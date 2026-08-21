/**
 * Single source of truth for everything SEO and contact related.
 * Change the values here and the metadata, JSON-LD, sitemap and footer
 * all follow.
 */

const rawUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.heavenonearthdestination.com";

export const siteConfig = {
  name: "Heaven on Earth",
  legalName: "Heaven on Earth Destination Experts",
  url: rawUrl,
  locale: "en_IN",
  language: "en-IN",
  tagline: "Your Journey. Our Local Expertise.",
  shortDescription:
    "Curated Himalayan journeys, homestays and destination experiences across Darjeeling, Sikkim, the Dooars and beyond.",
  description:
    "Heaven on Earth Destination Experts craft personal Himalayan journeys across Darjeeling, Sikkim, Kalimpong and the Dooars — handpicked homestays, curated tour packages and local guides who actually live there. Plan your trip with West Bengal travel specialists trusted by 450,000+ travellers.",
  keywords: [
    "Darjeeling tour packages",
    "Sikkim tour packages",
    "Dooars travel",
    "Himalayan homestays",
    "West Bengal travel agency",
    "Kalimpong tour",
    "North East India travel",
    "tea estate stay Darjeeling",
    "customised Himalayan journeys",
    "Heaven on Earth Destination Experts",
  ],
  phone: "+919051261413",
  phoneDisplay: "+91 9051261413",
  email: "hello@heavenonearthdestination.com",
  address: {
    street: "Hill Cart Road",
    locality: "Siliguri",
    region: "West Bengal",
    postalCode: "734001",
    country: "IN",
  },
  geo: { latitude: 26.7271, longitude: 88.3953 },
  openingHours: "Mo-Su 09:00-20:00",
  priceRange: "₹₹",
  foundingYear: "2014",
  social: {
    facebook: "https://www.facebook.com/heavenonearthdestination",
    instagram: "https://www.instagram.com/heavenonearthdestination",
    whatsapp: "https://wa.me/919051261413",
  },
  rating: { value: 4.9, count: 1284 },
  trustedBy: "450k",
  ogImage: "/images/hero-darjeeling.jpg",
} as const;

export type SiteConfig = typeof siteConfig;

/** Absolute URL helper — JSON-LD and OG tags must never emit relative paths. */
export const absoluteUrl = (path = "/") =>
  `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Destinations", href: "/destinations" },
  { label: "HomeStays", href: "/homestays" },
  { label: "About us", href: "/about" },
  { label: "Reviews", href: "/reviews" },
] as const;

export const footerLinks = {
  explore: [
    { label: "Destinations", href: "/destinations" },
    { label: "Homestays", href: "/homestays" },
    { label: "Travel Styles", href: "/travel-styles" },
    { label: "Curated Trips", href: "/packages" },
  ],
  company: [
    { label: "Our Story", href: "/about" },
    { label: "Contact Expert", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
  ],
} as const;
