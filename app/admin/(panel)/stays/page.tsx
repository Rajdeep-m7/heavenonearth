"use client";

import Link from "next/link";

import { previewSrc, type AdminImage } from "@/components/admin/ImageUploader";
import { useToast } from "@/components/admin/Toast";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
} from "@/components/admin/ui";
import { ApiClientError, api } from "@/lib/admin/api";
import { useResource } from "@/lib/admin/useResource";

type StayRow = {
  _id: string;
  name: string;
  slug: string;
  summary: string;
  coverImage?: AdminImage;
  location?: { locality?: string; region?: string };
  propertyType: string;
  priceFrom: number;
  isActive: boolean;
  isFeatured: boolean;
  roomCount: number;
};

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function StaysPage() {
  const toast = useToast();
  const { data, loading, error, reload } =
    useResource<StayRow[]>("/api/admin/stays");

  const remove = async (row: StayRow) => {
    if (
      !confirm(
        `Delete “${row.name}”? Its ${row.roomCount} room${row.roomCount === 1 ? "" : "s"} will be deleted too. This cannot be undone.`,
      )
    ) {
      return;
    }
    try {
      await api.del(`/api/stays/${row._id}`);
      toast.success(`Deleted “${row.name}”.`);
      await reload();
    } catch (err) {
      toast.error(
        err instanceof ApiClientError ? err.message : "Could not delete.",
      );
    }
  };

  const toggle = async (row: StayRow, key: "isActive" | "isFeatured") => {
    try {
      await api.patch(`/api/stays/${row._id}`, { [key]: !row[key] });
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
        title="Room stays"
        description="Homestays, tea bungalows and retreats. Rooms are managed inside each stay."
        action={
          <Link href="/admin/stays/new">
            <Button>New stay</Button>
          </Link>
        }
      />

      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && data.length === 0 && (
        <EmptyState
          title="No stays yet"
          description="Add your first property, then add its rooms."
          action={
            <Link href="/admin/stays/new">
              <Button>New stay</Button>
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
                      {row.name}
                    </p>
                    {!row.isActive && <Badge tone="danger">Hidden</Badge>}
                    {row.isFeatured && <Badge tone="warning">Featured</Badge>}
                    <Badge tone={row.roomCount === 0 ? "danger" : "info"}>
                      {row.roomCount} room{row.roomCount === 1 ? "" : "s"}
                    </Badge>
                  </div>
                  <p className="mt-1 line-clamp-1 text-[14px] text-slate">
                    {row.summary}
                  </p>
                  <p className="mt-1.5 text-[13px] text-slate">
                    {[row.location?.locality, row.location?.region]
                      .filter(Boolean)
                      .join(", ") || "No location set"}
                    {row.priceFrom > 0 && (
                      <>
                        {" "}
                        &middot;{" "}
                        <span className="font-semibold text-teal">
                          from {inr.format(row.priceFrom)}
                        </span>{" "}
                        / night
                      </>
                    )}
                  </p>
                  {row.roomCount === 0 && (
                    <p className="mt-1.5 text-[13px] font-medium text-red-600">
                      Add at least one room — without it there is nothing to book.
                    </p>
                  )}
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
                  <Link href={`/admin/stays/${row._id}`}>
                    <Button variant="secondary" size="sm">
                      Edit &amp; rooms
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
