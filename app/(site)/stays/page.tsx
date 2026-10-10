import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo/metadata";
import Link from "next/link";

import { JsonLd } from "@/components/seo/JsonLd";
import { EmptyGrid } from "@/components/site/EmptyGrid";
import { StayCard } from "@/components/stays/StayCard";
import { getCategories } from "@/lib/queries/destinations";
import { getStaysList } from "@/lib/queries/stays";
import { buildStaysIndexGraph } from "@/lib/seo/schema";

export const metadata: Metadata = pageMetadata({
  title: "Room Stays",
  description:
    "Homestays, tea bungalows and forest retreats across the Eastern Himalayas — handpicked, not aggregated.",
  path: "/stays",
});

type SearchParams = Promise<{ category?: string; page?: string }>;

export default async function StaysPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const activeCategory = params.category;
  const page = Math.max(1, Number(params.page) || 1);

  const [categories, result, allStaysForGraph] = await Promise.all([
    getCategories(),
    getStaysList(activeCategory, page),
    getStaysList(undefined, 1),
  ]);

  const { stays, total, pages } = result;

  return (
    <div className="bg-mint">
      <JsonLd id="stays-jsonld" data={buildStaysIndexGraph(allStaysForGraph.stays)} />

      <section className="bg-ink py-20 sm:py-24">
        <div className="mx-auto max-w-[1400px] px-6 text-center sm:px-10">
          <p className="text-[13px] font-medium uppercase tracking-eyebrow text-gold">
            Stay Like You Belong Here
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.4rem,6vw,3.8rem)] font-semibold leading-[1.08] text-white">
            Stay Somewhere Worth Remembering
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-relaxed text-white/80">
            Curated homestays, heritage tea estates and quiet retreats —
            {" "}{total} propert{total === 1 ? "y" : "ies"} and counting.
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
                href="/stays"
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
                  href={`/stays?category=${category.slug}`}
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

          {stays.length === 0 ? (
            <EmptyGrid
              title="No stays match this filter"
              description="Try a different destination, or view all stays."
            />
          ) : (
            <>
              <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {stays.map((stay) => (
                  <StayCard key={stay._id} stay={stay} />
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
                      const href = query.size ? `/stays?${query}` : "/stays";

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
