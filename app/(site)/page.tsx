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
import { getHeroSlides } from "@/lib/queries/hero";
import { getTrendingData } from "@/lib/queries/trending";
import { pageMetadata } from "@/lib/seo/metadata";
import { buildHomeGraph } from "@/lib/seo/schema";
import { siteConfig } from "@/lib/site";

/**
 * Statically rendered. `getHomeData` is tag-cached, so a visitor costs zero
 * database reads until an admin saves something or the hourly window lapses.
 */
// Must be a literal — Next statically analyses this export.
// Keep in step with REVALIDATE_SECONDS in lib/cache.ts.
export const revalidate = 3600;

// Search results cut titles near 60 characters and descriptions near 160, so the
// home page carries purpose-written short versions. (siteConfig.description is
// the long form, used for structured data.)
const HOME_TITLE = "Himalayan Tour Packages & Homestays";
const HOME_DESCRIPTION =
  "Personal Himalayan journeys across Darjeeling, Sikkim, Kalimpong and the Dooars — curated tour packages, handpicked homestays and local guides.";

const homeMetadata = pageMetadata({
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  path: "/",
});

export const metadata: Metadata = {
  ...homeMetadata,
  // `absolute` skips the "| Heaven on Earth" suffix, which would push it past 60.
  title: { absolute: `${HOME_TITLE} | ${siteConfig.name}` },
  openGraph: {
    ...homeMetadata.openGraph,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.shortDescription,
  },
};

export default async function HomePage() {
  const [data, trendingData, heroSlides] = await Promise.all([
    getHomeData(),
    getTrendingData(),
    getHeroSlides(),
  ]);

  return (
    <>
      <JsonLd id="home-jsonld" data={buildHomeGraph(data)} />
      <Hero rating={data.rating} slides={heroSlides} />
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
