import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo/metadata";
import Image from "next/image";
import Link from "next/link";

import { EmptyGrid } from "@/components/site/EmptyGrid";
import { getCategories } from "@/lib/queries/destinations";
import { getGalleryItems } from "@/lib/queries/gallery";

export const metadata: Metadata = pageMetadata({
  title: "Gallery",
  description:
    "Tea gardens, mountain roads, and quiet homestays — a look at the Eastern Himalayas through the journeys we've curated.",
  path: "/gallery",
});

type SearchParams = Promise<{ category?: string; page?: string }>;

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const activeCategory = params.category;
  const page = Math.max(1, Number(params.page) || 1);

  const [categories, result] = await Promise.all([
    getCategories(),
    getGalleryItems(activeCategory, page),
  ]);

  const { items, pages } = result;

  return (
    <div className="bg-mint">
      <section className="bg-ink py-20 sm:py-24">
        <div className="mx-auto max-w-[1400px] px-6 text-center sm:px-10">
          <p className="text-[13px] font-medium uppercase tracking-eyebrow text-gold">
            A Look Around
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.4rem,6vw,3.8rem)] font-semibold leading-[1.08] text-white">
            Gallery
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-relaxed text-white/80">
            Tea gardens, mountain roads and quiet mornings from the journeys
            we&rsquo;ve curated.
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
                href="/gallery"
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
                  href={`/gallery?category=${category.slug}`}
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

          {items.length === 0 ? (
            <EmptyGrid
              title="No photos here yet"
              description="Check back soon, or browse a different destination."
            />
          ) : (
            <>
              <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
                {items.map((item) => {
                  const src = item.image.publicId || item.image.url;
                  return (
                    <figure
                      key={item._id}
                      className="break-inside-avoid overflow-hidden rounded-2xl bg-white shadow-card"
                    >
                      <div className="relative aspect-[4/5] w-full">
                        <Image
                          src={src}
                          alt={item.image.alt || item.title || "Himalayan travel photo"}
                          fill
                          sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 320px"
                          className="object-cover"
                        />
                      </div>
                      {(item.title || item.caption) && (
                        <figcaption className="p-3">
                          {item.title && (
                            <p className="text-[13px] font-semibold text-ink">
                              {item.title}
                            </p>
                          )}
                          {item.caption && (
                            <p className="mt-0.5 text-[12px] text-slate">
                              {item.caption}
                            </p>
                          )}
                        </figcaption>
                      )}
                    </figure>
                  );
                })}
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
                      const href = query.size ? `/gallery?${query}` : "/gallery";

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
