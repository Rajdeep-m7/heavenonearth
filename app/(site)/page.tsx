import type { Metadata } from "next";

import { Hero } from "@/components/home/Hero";
import { RegionsSection } from "@/components/home/RegionsSection";
import { TrendingSection } from "@/components/home/TrendingSection";
import { JourneysSection } from "@/components/home/JourneysSection";
import { HomestaysSection } from "@/components/home/HomestaysSection";
import { StorySection } from "@/components/home/StorySection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { FinalCta } from "@/components/home/FinalCta";
import { JsonLd } from "@/components/seo/JsonLd";
import { getHomeData } from "@/lib/queries/home";
import { getTrendingData } from "@/lib/queries/trending";
import { buildHomeGraph } from "@/lib/seo/schema";
import { siteConfig } from "@/lib/site";

/**
 * Statically rendered. `getHomeData` is tag-cached, so a visitor costs zero
 * database reads until an admin saves something or the hourly window lapses.
 */
// Must be a literal — Next statically analyses this export.
// Keep in step with REVALIDATE_SECONDS in lib/cache.ts.
export const revalidate = 3600;

export const metadata: Metadata = {
  title:
    "Himalayan Tour Packages, Homestays & Destination Experts | Darjeeling, Sikkim & Dooars",
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    url: siteConfig.url,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.shortDescription,
  },
};

export default async function HomePage() {
  const [data, trendingData] = await Promise.all([
    getHomeData(),
    getTrendingData()
  ]);

  return (
    <>
      <JsonLd id="home-jsonld" data={buildHomeGraph(data)} />
      <Hero rating={data.rating} />
      <RegionsSection regions={data.regions} />
      <TrendingSection data={trendingData} />
      <JourneysSection journeys={data.journeys} />
      <HomestaysSection stays={data.stays} />
      <StorySection />
      <TestimonialsSection
        testimonials={data.testimonials}
        rating={data.rating}
      />
      <FinalCta />
    </>
  );
}
