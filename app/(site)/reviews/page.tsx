import type { Metadata } from "next";
import Link from "next/link";

import { ReviewCard } from "@/components/packages/ReviewCard";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { EmptyGrid } from "@/components/site/EmptyGrid";
import { Star } from "@/components/ui/Icons";
import { getApprovedReviews } from "@/lib/queries/reviews";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Reviews",
  description:
    "What travellers say after a Heaven on Earth journey through Darjeeling, Sikkim and the Dooars.",
  alternates: { canonical: "/reviews" },
};

type SearchParams = Promise<{ page?: string }>;

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const { reviews, pages, rating } = await getApprovedReviews(page);
  const value = rating?.value ?? siteConfig.rating.value;
  const count = rating?.count ?? siteConfig.rating.count;

  return (
    <div className="bg-mint">
      <section className="bg-teal py-20 sm:py-24">
        <div className="mx-auto max-w-[1400px] px-6 text-center sm:px-10">
          <p className="text-[13px] font-medium uppercase tracking-eyebrow text-gold">
            Testimonials
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.4rem,6vw,3.8rem)] font-semibold leading-[1.08] text-white">
            Stories From The Road
          </h1>
          <div
            className="mt-5 flex items-center justify-center gap-2 text-white"
            role="img"
            aria-label={`Rated ${value.toFixed(1)} out of 5 by ${count} travellers`}
          >
            <div className="flex gap-1 text-gold">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="size-5" />
              ))}
            </div>
            <span className="font-semibold">{value.toFixed(1)}</span>
            <span className="text-white/75">
              &middot; {count.toLocaleString("en-IN")} travellers
            </span>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-6 sm:px-10 lg:grid-cols-[1fr_360px]">
          <div>
            {reviews.length === 0 ? (
              <EmptyGrid
                title="No reviews yet"
                description="Be the first to share how your trip went."
              />
            ) : (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  {reviews.map((review) => (
                    <ReviewCard key={review._id} review={review} />
                  ))}
                </div>

                {pages > 1 && (
                  <nav
                    aria-label="Pagination"
                    className="mt-10 flex items-center justify-center gap-2"
                  >
                    {Array.from({ length: pages }, (_, index) => index + 1).map(
                      (pageNumber) => (
                        <Link
                          key={pageNumber}
                          href={pageNumber > 1 ? `/reviews?page=${pageNumber}` : "/reviews"}
                          aria-current={pageNumber === page ? "page" : undefined}
                          className={`grid size-10 place-items-center rounded-full text-[14px] font-medium transition ${
                            pageNumber === page
                              ? "bg-ink text-gold"
                              : "bg-white text-slate hover:text-ink"
                          }`}
                        >
                          {pageNumber}
                        </Link>
                      ),
                    )}
                  </nav>
                )}
              </>
            )}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <ReviewForm />
          </aside>
        </div>
      </section>
    </div>
  );
}
