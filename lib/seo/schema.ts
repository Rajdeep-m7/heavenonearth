import { absoluteUrl, siteConfig } from "@/lib/site";
import type { HomeData } from "@/lib/queries/home";
import type { CategorySummary, CategoryWithPackages } from "@/lib/queries/destinations";
import type { PackagePageData } from "@/lib/queries/packages";
import type { StayCard, StayPageData } from "@/lib/queries/stays";

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

  // Placeholder testimonials must never be marked up as real reviews.
  const reviewNodes: Node[] = (data.usingFixtures ? [] : data.testimonials).map((testimonial) => ({
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

/** Reusable breadcrumb trail for any page below the home page. */
function breadcrumbFor(trail: { name: string; path: string }[]): Node {
  return {
    "@type": "BreadcrumbList",
    "@id": absoluteUrl(`${trail[trail.length - 1].path}#breadcrumb`),
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      ...trail.map((step, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: step.name,
        item: absoluteUrl(step.path),
      })),
    ],
  };
}

/** `/destinations` — the full list of master packages as a CollectionPage. */
export function buildDestinationsIndexGraph(categories: CategorySummary[]) {
  const path = "/destinations";
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": absoluteUrl(`${path}#webpage`),
        url: absoluteUrl(path),
        name: "Destinations | Heaven on Earth",
        description:
          "Every region Heaven on Earth curates journeys for — hill, forest and coastal escapes across the Eastern Himalayas and beyond.",
        isPartOf: { "@id": SITE_ID },
        breadcrumb: { "@id": absoluteUrl(`${path}#breadcrumb`) },
      },
      breadcrumbFor([{ name: "Destinations", path }]),
      {
        "@type": "ItemList",
        "@id": absoluteUrl(`${path}#list`),
        numberOfItems: categories.length,
        itemListElement: categories.map((category, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "TouristDestination",
            "@id": absoluteUrl(`/destinations/${category.slug}#destination`),
            name: category.name,
            description: category.tagline || category.description,
            url: absoluteUrl(`/destinations/${category.slug}`),
            image: imageUrl(category.thumbnail?.publicId ?? category.thumbnail?.url ?? ""),
          },
        })),
      },
    ],
  };
}

/** `/destinations/[category]` — the category plus its packages. */
export function buildCategoryGraph({ category, packages }: CategoryWithPackages) {
  const path = `/destinations/${category.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["CollectionPage", "TouristDestination"],
        "@id": absoluteUrl(`${path}#webpage`),
        url: absoluteUrl(path),
        name: `${category.name} | ${siteConfig.name}`,
        description: category.tagline || category.description || siteConfig.shortDescription,
        image: imageUrl(
          category.heroImage?.publicId ??
            category.thumbnail?.publicId ??
            category.heroImage?.url ??
            "",
        ),
        isPartOf: { "@id": SITE_ID },
        breadcrumb: { "@id": absoluteUrl(`${path}#breadcrumb`) },
      },
      breadcrumbFor([
        { name: "Destinations", path: "/destinations" },
        { name: category.name, path },
      ]),
      {
        "@type": "ItemList",
        "@id": absoluteUrl(`${path}#packages`),
        numberOfItems: packages.length,
        itemListElement: packages.map((pkg, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": ["Product", "TouristTrip"],
            "@id": absoluteUrl(`/packages/${pkg.slug}#trip`),
            name: pkg.title,
            url: absoluteUrl(`/packages/${pkg.slug}`),
            image: imageUrl(pkg.coverImage?.publicId ?? pkg.coverImage?.url ?? ""),
            offers: {
              "@type": "Offer",
              price: pkg.priceFrom,
              priceCurrency: "INR",
              url: absoluteUrl(`/packages/${pkg.slug}`),
            },
          },
        })),
      },
    ],
  };
}

/** `/packages/[slug]` — full trip detail, offer, and its own reviews. */
export function buildPackageGraph({ pkg, reviews, rating }: PackagePageData) {
  const path = `/packages/${pkg.slug}`;
  const tripId = absoluteUrl(`${path}#trip`);

  const reviewNodes: Node[] = reviews.map((review) => ({
    "@type": "Review",
    "@id": absoluteUrl(`${path}#review-${review._id}`),
    itemReviewed: { "@id": tripId },
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: review.quote,
    author: { "@type": "Person", name: review.author },
    ...(review.publishedAt ? { datePublished: review.publishedAt.slice(0, 10) } : {}),
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Product", "TouristTrip"],
        "@id": tripId,
        name: pkg.title,
        description: pkg.seo?.description || pkg.summary,
        url: absoluteUrl(path),
        image: imageUrl(pkg.coverImage?.publicId ?? pkg.coverImage?.url ?? ""),
        brand: { "@id": ORG_ID },
        provider: { "@id": ORG_ID },
        isPartOf: { "@id": SITE_ID },
        breadcrumb: { "@id": absoluteUrl(`${path}#breadcrumb`) },
        itinerary: {
          "@type": "ItemList",
          name: `${pkg.title} — ${pkg.duration}`,
          numberOfItems: pkg.itinerary.length || pkg.days,
        },
        offers: {
          "@type": "Offer",
          price: pkg.priceFrom,
          priceCurrency: pkg.currency,
          availability: "https://schema.org/InStock",
          url: absoluteUrl(path),
          priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
          seller: { "@id": ORG_ID },
          itemCondition: "https://schema.org/NewCondition",
        },
        // Only emitted with real approved reviews backing it — a fabricated
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
      },
      breadcrumbFor([
        { name: "Packages", path: "/packages" },
        { name: pkg.title, path },
      ]),
      ...reviewNodes,
    ],
  };
}

/** `/stays` — every active property as a CollectionPage + ItemList. */
export function buildStaysIndexGraph(stays: StayCard[]) {
  const path = "/stays";
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": absoluteUrl(`${path}#webpage`),
        url: absoluteUrl(path),
        name: "Room Stays | Heaven on Earth",
        description:
          "Homestays, tea bungalows and forest retreats across the Eastern Himalayas — handpicked, not aggregated.",
        isPartOf: { "@id": SITE_ID },
        breadcrumb: { "@id": absoluteUrl(`${path}#breadcrumb`) },
      },
      breadcrumbFor([{ name: "Room Stays", path }]),
      {
        "@type": "ItemList",
        "@id": absoluteUrl(`${path}#list`),
        numberOfItems: stays.length,
        itemListElement: stays.map((stay, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "LodgingBusiness",
            "@id": absoluteUrl(`/stays/${stay.slug}#lodging`),
            name: stay.name,
            description: stay.summary,
            url: absoluteUrl(`/stays/${stay.slug}`),
            image: imageUrl(stay.coverImage?.publicId ?? stay.coverImage?.url ?? ""),
            priceRange: siteConfig.priceRange,
          },
        })),
      },
    ],
  };
}

/** `/stays/[slug]` — the property, its rooms as offers, and its reviews. */
export function buildStayGraph({ stay, rooms, reviews, rating }: StayPageData) {
  const path = `/stays/${stay.slug}`;
  const lodgingId = absoluteUrl(`${path}#lodging`);

  const reviewNodes: Node[] = reviews.map((review) => ({
    "@type": "Review",
    "@id": absoluteUrl(`${path}#review-${review._id}`),
    itemReviewed: { "@id": lodgingId },
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: review.quote,
    author: { "@type": "Person", name: review.author },
    ...(review.publishedAt ? { datePublished: review.publishedAt.slice(0, 10) } : {}),
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LodgingBusiness",
        "@id": lodgingId,
        name: stay.name,
        description: stay.seo?.description || stay.summary,
        url: absoluteUrl(path),
        image: imageUrl(stay.coverImage?.publicId ?? stay.coverImage?.url ?? ""),
        parentOrganization: { "@id": ORG_ID },
        isPartOf: { "@id": SITE_ID },
        breadcrumb: { "@id": absoluteUrl(`${path}#breadcrumb`) },
        priceRange: siteConfig.priceRange,
        checkinTime: stay.checkInTime,
        checkoutTime: stay.checkOutTime,
        amenityFeature: stay.amenities.map((amenity) => ({
          "@type": "LocationFeatureSpecification",
          name: amenity,
          value: true,
        })),
        address: {
          "@type": "PostalAddress",
          streetAddress: stay.location.address,
          addressLocality: stay.location.locality,
          addressRegion: stay.location.region,
          addressCountry: stay.location.country || "IN",
        },
        ...(stay.location.lat && stay.location.lng
          ? {
              geo: {
                "@type": "GeoCoordinates",
                latitude: stay.location.lat,
                longitude: stay.location.lng,
              },
            }
          : {}),
        makesOffer: rooms.map((room) => ({
          "@type": "Offer",
          name: room.name,
          price: room.pricePerNight,
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
        })),
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
      },
      breadcrumbFor([
        { name: "Room Stays", path: "/stays" },
        { name: stay.name, path },
      ]),
      ...reviewNodes,
    ],
  };
}
