"use client";

import Link from "next/link";

import {
  Badge,
  Card,
  ErrorState,
  PageHeader,
  Spinner,
} from "@/components/admin/ui";
import { useResource } from "@/lib/admin/useResource";

type Stats = {
  counts: {
    categories: number;
    packages: number;
    packagesActive: number;
    stays: number;
    rooms: number;
    gallery: number;
    reviewsPending: number;
    reviewsApproved: number;
  };
  recentReviews: {
    _id: string;
    author: string;
    quote: string;
    rating: number;
    status: "pending" | "approved" | "rejected";
    createdAt: string;
  }[];
};

const TONE = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
} as const;

export default function DashboardPage() {
  const { data, loading, error, reload } = useResource<Stats>("/api/admin/stats");

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Everything on the live site at a glance."
      />

      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Master packages"
              value={data.counts.categories}
              href="/admin/categories"
            />
            <Stat
              label="Packages"
              value={data.counts.packages}
              note={`${data.counts.packagesActive} live`}
              href="/admin/packages"
            />
            <Stat
              label="Room stays"
              value={data.counts.stays}
              note={`${data.counts.rooms} rooms`}
              href="/admin/stays"
            />
            <Stat
              label="Gallery images"
              value={data.counts.gallery}
              href="/admin/gallery"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Stat
              label="Reviews awaiting approval"
              value={data.counts.reviewsPending}
              href="/admin/reviews?status=pending"
              highlight={data.counts.reviewsPending > 0}
            />
            <Stat
              label="Published reviews"
              value={data.counts.reviewsApproved}
              href="/admin/reviews?status=approved"
            />
          </div>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-ink">
                Latest reviews
              </h2>
              <Link
                href="/admin/reviews"
                className="text-[14px] font-semibold text-teal-deep hover:underline"
              >
                View all
              </Link>
            </div>

            {data.recentReviews.length === 0 ? (
              <p className="mt-4 text-[14px] text-slate">
                No reviews have come in yet.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-black/8">
                {data.recentReviews.map((review) => (
                  <li key={review._id} className="flex gap-4 py-3.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5">
                        <p className="truncate text-[14px] font-semibold text-ink">
                          {review.author}
                        </p>
                        <Badge tone={TONE[review.status]}>{review.status}</Badge>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[13px] text-slate">
                        {review.quote}
                      </p>
                    </div>
                    <span className="shrink-0 text-[13px] font-semibold text-gold-deep">
                      {review.rating}/5
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  note,
  href,
  highlight = false,
}: {
  label: string;
  value: number;
  note?: string;
  href: string;
  highlight?: boolean;
}) {
  return (
    <Link href={href} className="group block">
      <Card
        className={`p-5 transition group-hover:-translate-y-0.5 group-hover:shadow-card ${
          highlight ? "border-gold/60 bg-gold/10" : ""
        }`}
      >
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate">
          {label}
        </p>
        <p className="mt-2 font-display text-4xl font-bold text-ink">{value}</p>
        {note && <p className="mt-1 text-[13px] text-slate">{note}</p>}
      </Card>
    </Link>
  );
}
