import { absoluteUrl, siteConfig } from "@/lib/site";
import type { HomeData } from "@/lib/queries/home";

/**
 * One @graph so the crawler resolves cross-references by @id instead of
 * re-parsing duplicated entities. Everything is built from live data, so the
 * markup can never drift from what the page actually renders.
 */

const ORG_ID = absoluteUrl("/#organization");
const SITE_ID = absoluteUrl("/#website");
const PAGE_ID = absoluteUrl("/#webpage");

type Node = Record<string, unknown>;

/** Cloudinary publicIds are relative; local fixtures are already absolute. */
const imageUrl = (src: string) => {
  if (!src) return absoluteUrl(siteConfig.ogImage);
  if (src.startsWith("http")) return src;
  if (src.startsWith("/")) return absoluteUrl(src);
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return cloud
    ? `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,w_1200/${src}`
    : absoluteUrl(siteConfig.ogImage);
};

function organization(rating: HomeData["rating"], regions: HomeData["regions"]): Node {
  return {
    "@type": ["TravelAgency", "Organization"],
    "@id": ORG_ID,
    name: siteConfig.legalName,
    alternateName: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    slogan: siteConfig.tagline,
    foundingDate: siteConfig.foundingYear,
    logo: {
      "@type": "ImageObject",
      "@id": absoluteUrl("/#logo"),
      url: absoluteUrl("/images/logo.png"),
      contentUrl: absoluteUrl("/images/logo.png"),
      width: 634,
      height: 640,
      caption: siteConfig.legalName,
    },
    image: { "@id": absoluteUrl("/#logo") },
    telephone: siteConfig.phone,
    email: siteConfig.email,
    priceRange: siteConfig.priceRange,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.locality,
      addressRegion: siteConfig.address.region,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.geo.latitude,
      longitude: siteConfig.geo.longitude,
    },
    openingHours: siteConfig.openingHours,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: siteConfig.phone,
      email: siteConfig.email,
      contactType: "customer service",
      areaServed: ["IN", "Worldwide"],
      availableLanguage: ["en", "hi", "bn", "ne"],
    },
    areaServed: regions.map((region) => ({
      "@type": "AdministrativeArea",
      name: region.name,
    })),
    sameAs: Object.values(siteConfig.social),
    // Only emitted when real approved reviews back it up — a fabricated
    // aggregateRating is exactly what earns a structured-data penalty.
    ...(rating && rating.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating.value,
            reviewCount: rating.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };
}

const website: Node = {
  "@type": "WebSite",
  "@id": SITE_ID,
  url: siteConfig.url,
  name: siteConfig.name,
  description: siteConfig.shortDescription,
  publisher: { "@id": ORG_ID },
  inLanguage: siteConfig.language,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: absoluteUrl("/destinations?q={search_term_string}"),
    },
    "query-input": "required name=search_term_string",
  },
};

const webPage: Node = {
  "@type": ["WebPage", "CollectionPage"],
  "@id": PAGE_ID,
  url: siteConfig.url,
  name: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  isPartOf: { "@id": SITE_ID },
  about: { "@id": ORG_ID },
  primaryImageOfPage: {
    "@type": "ImageObject",
    url: absoluteUrl(siteConfig.ogImage),
  },
  inLanguage: siteConfig.language,
  breadcrumb: { "@id": absoluteUrl("/#breadcrumb") },
};

const breadcrumb: Node = {
  "@type": "BreadcrumbList",
  "@id": absoluteUrl("/#breadcrumb"),
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
  ],
};

export function buildHomeGraph(data: HomeData) {
  const destinationList: Node = {
    "@type": "ItemList",
    "@id": absoluteUrl("/#destinations"),
    name: "Destinations curated by Heaven on Earth",
    numberOfItems: data.regions.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: data.regions.map((region, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "TouristDestination",
        "@id": absoluteUrl(`/destinations/${region.slug}#destination`),
        name: region.name,
        description: region.blurb,
        url: absoluteUrl(`/destinations/${region.slug}`),
        image: imageUrl(region.image),
        touristType: ["Leisure", "Nature", "Culture"],
      },
    })),
  };

  const journeyNodes: Node[] = data.journeys.map((journey) => ({
    "@type": ["Product", "TouristTrip"],
    "@id": absoluteUrl(`/packages/${journey.slug}#trip`),
    name: journey.title,
    description: journey.quote,
    url: absoluteUrl(`/packages/${journey.slug}`),
    image: imageUrl(journey.image),
    brand: { "@id": ORG_ID },
    provider: { "@id": ORG_ID },
    touristType: ["Couples", "Families", "Solo travellers"],
    itinerary: {
      "@type": "ItemList",
      name: `${journey.title} — ${journey.duration}`,
    },
    offers: {
      "@type": "Offer",
      price: journey.priceFrom,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: absoluteUrl(`/packages/${journey.slug}`),
      priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
      seller: { "@id": ORG_ID },
      itemCondition: "https://schema.org/NewCondition",
    },
  }));

  const stayNodes: Node[] = data.stays.map((stay) => ({
    "@type": "LodgingBusiness",
    "@id": absoluteUrl(`/stays/${stay.slug}#lodging`),
    name: stay.name,
    description: stay.blurb,
    url: absoluteUrl(`/stays/${stay.slug}`),
    image: imageUrl(stay.image),
    address: {
      "@type": "PostalAddress",
      addressLocality: stay.location,
      addressCountry: "IN",
    },
    priceRange: siteConfig.priceRange,
    parentOrganization: { "@id": ORG_ID },
  }));

  const reviewNodes: Node[] = data.testimonials.map((testimonial) => ({
    "@type": "Review",
    "@id": absoluteUrl(`/reviews#${testimonial.id}`),
    itemReviewed: { "@id": ORG_ID },
    reviewRating: {
      "@type": "Rating",
      ratingValue: testimonial.rating,
      bestRating: 5,
      worstRating: 1,
    },
    name: testimonial.trip || testimonial.author,
    reviewBody: testimonial.quote,
    datePublished: testimonial.datePublished,
    author: { "@type": "Person", name: testimonial.author },
    publisher: { "@id": ORG_ID },
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      organization(data.rating, data.regions),
      website,
      webPage,
      breadcrumb,
      destinationList,
      ...journeyNodes,
      ...stayNodes,
      ...reviewNodes,
    ],
  };
}
