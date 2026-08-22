"use client";

import Link from "next/link";
import { useState } from "react";

import { previewSrc, type AdminImage } from "@/components/admin/ImageUploader";
import { useToast } from "@/components/admin/Toast";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Select,
  Spinner,
} from "@/components/admin/ui";
import { ApiClientError, api } from "@/lib/admin/api";
import { useResource } from "@/lib/admin/useResource";

type PackageRow = {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  days: number;
  nights: number;
  priceFrom: number;
  coverImage?: AdminImage;
  badge: "bestSeller" | "newJourney" | "none";
  isActive: boolean;
  isFeatured: boolean;
  category?: { _id: string; name: string; slug: string } | null;
};

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function PackagesPage() {
  const toast = useToast();
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");

  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (q.trim()) query.set("q", q.trim());

  const { data, loading, error, reload } = useResource<PackageRow[]>(
    `/api/admin/packages${query.toString() ? `?${query}` : ""}`,
  );

  const remove = async (row: PackageRow) => {
    if (
      !confirm(
        `Delete “${row.title}”? Its images will be removed from Cloudinary too. This cannot be undone.`,
      )
    ) {
      return;
    }
    try {
      await api.del(`/api/packages/${row._id}`);
      toast.success(`Deleted “${row.title}”.`);
      await reload();
    } catch (err) {
      toast.error(
        err instanceof ApiClientError ? err.message : "Could not delete.",
      );
    }
  };

  const toggle = async (row: PackageRow, key: "isActive" | "isFeatured") => {
    try {
      await api.patch(`/api/packages/${row._id}`, { [key]: !row[key] });
      await reload();
    } catch (err) {
      toast.error(
        err instanceof ApiClientError ? err.message : "Could not update.",
      );
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Packages"
        description="Curated journeys. Each one belongs to a master package."
        action={
          <Link href="/admin/packages/new">
            <Button>New package</Button>
          </Link>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title…"
          className="sm:max-w-xs"
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="sm:max-w-[180px]"
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="active">Live only</option>
          <option value="inactive">Hidden only</option>
        </Select>
      </div>

      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && data.length === 0 && (
        <EmptyState
          title="No packages match"
          description="Create your first curated journey, or clear the filters above."
          action={
            <Link href="/admin/packages/new">
              <Button>New package</Button>
            </Link>
          }
        />
      )}

      {data && data.length > 0 && (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-black/8">
            {data.map((row) => (
              <li key={row._id} className="flex flex-col gap-4 p-5 sm:flex-row">
                <div className="grid h-20 w-28 shrink-0 place-items-center overflow-hidden rounded-xl bg-black/[0.04]">
                  {row.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewSrc(row.coverImage, 240)}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="text-[11px] text-slate">No image</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-lg font-semibold text-ink">
                      {row.title}
                    </p>
                    {!row.isActive && <Badge tone="danger">Hidden</Badge>}
                    {row.isFeatured && <Badge tone="warning">Featured</Badge>}
                    {row.category && <Badge tone="info">{row.category.name}</Badge>}
                  </div>
                  <p className="mt-1 line-clamp-1 text-[14px] text-slate">
                    {row.summary}
                  </p>
                  <p className="mt-1.5 text-[13px] text-slate">
                    {row.days} days / {row.nights} nights &middot;{" "}
                    <span className="font-semibold text-teal">
                      {inr.format(row.priceFrom)}
                    </span>{" "}
                    per person
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-start gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggle(row, "isFeatured")}
                  >
                    {row.isFeatured ? "Unfeature" : "Feature"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggle(row, "isActive")}
                  >
                    {row.isActive ? "Hide" : "Publish"}
                  </Button>
                  <Link href={`/admin/packages/${row._id}`}>
                    <Button variant="secondary" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => remove(row)}>
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
