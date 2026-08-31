import type { Metadata } from "next";

import { CategoryCard } from "@/components/destinations/CategoryCard";
import { EmptyGrid } from "@/components/site/EmptyGrid";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCategories } from "@/lib/queries/destinations";
import { buildDestinationsIndexGraph } from "@/lib/seo/schema";
import { siteConfig } from "@/lib/site";

// Must be a literal — Next statically analyses this export.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Every region Heaven on Earth curates journeys for — hill, forest and coastal escapes across the Eastern Himalayas and beyond.",
  alternates: { canonical: "/destinations" },
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function DestinationsPage(props: Props) {
  const params = await props.searchParams;
  const q = typeof params.q === 'string' ? params.q : undefined;
  
  const categories = await getCategories();

  const query = q?.toLowerCase().trim();
  const filtered = query
    ? categories.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.tagline?.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query)
      )
    : categories;

  return (
    <div className="bg-mint">
      <JsonLd id="destinations-jsonld" data={buildDestinationsIndexGraph(categories)} />

      <section className="bg-ink py-20 sm:py-24">
        <div className="mx-auto max-w-[1400px] px-6 text-center sm:px-10">
          <p className="text-[13px] font-medium uppercase tracking-eyebrow text-gold">
            {siteConfig.tagline}
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.4rem,6vw,3.8rem)] font-semibold leading-[1.08] text-white">
            {query ? `Search Results for "${q}"` : "Find Your Next Place to Belong"}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-relaxed text-white/80">
            {query
              ? "Here are the destinations that match your search."
              : "Hill towns, forest belts, and everything curated in between — explore the regions Heaven on Earth knows best."}
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
          {filtered.length === 0 ? (
            <EmptyGrid
              title={query ? "No matches found" : "Destinations are being added"}
              description={query ? "Try searching for another region or clear your search to view all." : "Check back shortly — new regions are on the way."}
            />
          ) : (
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((category) => (
                <CategoryCard key={category._id} category={category} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
