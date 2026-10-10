import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo/metadata";
import Link from "next/link";

import { EmptyGrid } from "@/components/site/EmptyGrid";
import { PackageCard } from "@/components/packages/PackageCard";
import { getCategories } from "@/lib/queries/destinations";
import { getPackagesList } from "@/lib/queries/packages";

export const metadata: Metadata = pageMetadata({
  title: "Packages",
  description:
    "Curated Himalayan journeys — tea-garden escapes, monastery trails, and mountain road trips, priced and ready to plan.",
  path: "/packages",
});

type SearchParams = Promise<{ category?: string; page?: string }>;

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const activeCategory = params.category;
  const page = Math.max(1, Number(params.page) || 1);

  const [categories, result] = await Promise.all([
    getCategories(),
    getPackagesList(activeCategory, page),
  ]);

  const { packages, total, pages } = result;

  return (
    <div className="bg-mint">
      <section className="bg-ink py-20 sm:py-24">
        <div className="mx-auto max-w-[1400px] px-6 text-center sm:px-10">
          <p className="text-[13px] font-medium uppercase tracking-eyebrow text-gold">
            Journeys Made For You
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.4rem,6vw,3.8rem)] font-semibold leading-[1.08] text-white">
            Every Package We Curate
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-relaxed text-white/80">
            {total} journey{total === 1 ? "" : "s"}, each one planned around
            local knowledge rather than a fixed itinerary template.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
          {categories.length > 0 && (
            <nav
              aria-label="Filter by destination"
              className="mb-10 flex flex-wrap gap-2.5"
            >
              <Link
                href="/packages"
                className={`rounded-full px-5 py-2.5 text-[14px] font-medium transition ${
                  !activeCategory
                    ? "bg-ink text-gold"
                    : "bg-white text-slate hover:text-ink"
                }`}
              >
                All
              </Link>
              {categories.map((category) => (
                <Link
                  key={category._id}
                  href={`/packages?category=${category.slug}`}
                  className={`rounded-full px-5 py-2.5 text-[14px] font-medium transition ${
                    activeCategory === category.slug
                      ? "bg-ink text-gold"
                      : "bg-white text-slate hover:text-ink"
                  }`}
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          )}

          {packages.length === 0 ? (
            <EmptyGrid
              title="No packages match this filter"
              description="Try a different destination, or view all packages."
            />
          ) : (
            <>
              <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {packages.map((pkg) => (
                  <PackageCard key={pkg._id} pkg={pkg} />
                ))}
              </div>

              {pages > 1 && (
                <nav
                  aria-label="Pagination"
                  className="mt-12 flex items-center justify-center gap-2"
                >
                  {Array.from({ length: pages }, (_, index) => index + 1).map(
                    (pageNumber) => {
                      const query = new URLSearchParams();
                      if (activeCategory) query.set("category", activeCategory);
                      if (pageNumber > 1) query.set("page", String(pageNumber));
                      const href = query.size ? `/packages?${query}` : "/packages";

                      return (
                        <Link
                          key={pageNumber}
                          href={href}
                          aria-current={pageNumber === page ? "page" : undefined}
                          className={`grid size-10 place-items-center rounded-full text-[14px] font-medium transition ${
                            pageNumber === page
                              ? "bg-ink text-gold"
                              : "bg-white text-slate hover:text-ink"
                          }`}
                        >
                          {pageNumber}
                        </Link>
                      );
                    },
                  )}
                </nav>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
