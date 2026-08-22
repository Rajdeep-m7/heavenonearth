"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useToast } from "@/components/admin/Toast";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  Input,
  PageHeader,
  Select,
  Spinner,
  Textarea,
} from "@/components/admin/ui";
import { ApiClientError, api } from "@/lib/admin/api";
import { useResource } from "@/lib/admin/useResource";

type Review = {
  _id: string;
  author: string;
  quote: string;
  rating: number;
  trip?: string;
  location?: string;
  status: "pending" | "approved" | "rejected";
  isFeatured: boolean;
  source: "web" | "admin";
  createdAt: string;
  publishedAt?: string;
};

const TABS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Published" },
  { value: "rejected", label: "Rejected" },
  { value: "", label: "All" },
] as const;

const TONE = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
} as const;

function ReviewsInner() {
  const toast = useToast();
  const params = useSearchParams();
  const [status, setStatus] = useState<string>(params.get("status") ?? "pending");
  const [adding, setAdding] = useState(false);

  const { data, loading, error, reload } = useResource<Review[]>(
    `/api/admin/reviews?limit=50${status ? `&status=${status}` : ""}`,
  );

  const moderate = async (
    review: Review,
    patch: { status?: Review["status"]; isFeatured?: boolean },
  ) => {
    try {
      await api.patch(`/api/reviews/${review._id}`, patch);
      toast.success("Review updated.");
      await reload();
    } catch (err) {
      toast.error(
        err instanceof ApiClientError ? err.message : "Could not update.",
      );
    }
  };

  const remove = async (review: Review) => {
    if (!confirm(`Delete the review by ${review.author}?`)) return;
    try {
      await api.del(`/api/reviews/${review._id}`);
      toast.success("Review deleted.");
      await reload();
    } catch (err) {
      toast.error(
        err instanceof ApiClientError ? err.message : "Could not delete.",
      );
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reviews"
        description="Visitor submissions stay hidden until you approve them."
        action={
          <Button onClick={() => setAdding((v) => !v)}>
            {adding ? "Close" : "Add review"}
          </Button>
        }
      />

      {adding && (
        <AddReviewForm
          onDone={async () => {
            setAdding(false);
            setStatus("approved");
            await reload();
          }}
        />
      )}

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={`rounded-full px-5 py-2 text-[14px] font-medium transition ${
              status === tab.value
                ? "bg-ink text-gold"
                : "bg-white text-slate hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && data.length === 0 && (
        <EmptyState
          title="Nothing here"
          description={
            status === "pending"
              ? "No reviews are waiting for approval."
              : "No reviews match this filter."
          }
        />
      )}

      {data && data.length > 0 && (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-black/8">
            {data.map((review) => (
              <li key={review._id} className="p-5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <p className="font-semibold text-ink">{review.author}</p>
                  <Badge tone={TONE[review.status]}>{review.status}</Badge>
                  {review.isFeatured && <Badge tone="warning">Featured</Badge>}
                  {review.source === "admin" && <Badge>Added by admin</Badge>}
                  <span className="text-[13px] font-semibold text-gold-deep">
                    {review.rating}/5
                  </span>
                </div>

                <p className="mt-2 text-[15px] italic text-slate">
                  &ldquo;{review.quote}&rdquo;
                </p>

                {(review.trip || review.location) && (
                  <p className="mt-1.5 text-[13px] text-slate">
                    {[review.trip, review.location].filter(Boolean).join(" · ")}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {review.status !== "approved" && (
                    <Button
                      size="sm"
                      onClick={() => moderate(review, { status: "approved" })}
                    >
                      Approve
                    </Button>
                  )}
                  {review.status !== "rejected" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => moderate(review, { status: "rejected" })}
                    >
                      Reject
                    </Button>
                  )}
                  {review.status === "approved" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        moderate(review, { isFeatured: !review.isFeatured })
                      }
                    >
                      {review.isFeatured
                        ? "Remove from home page"
                        : "Feature on home page"}
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => remove(review)}>
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

function AddReviewForm({ onDone }: { onDone: () => void }) {
  const toast = useToast();
  const [author, setAuthor] = useState("");
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState(5);
  const [trip, setTrip] = useState("");
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFields({});
    try {
      await api.post("/api/admin/reviews", {
        author,
        quote,
        rating,
        trip: trip || undefined,
      });
      toast.success("Review published.");
      setAuthor("");
      setQuote("");
      setTrip("");
      onDone();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setFields(err.fields ?? {});
        toast.error(err.message);
      } else {
        toast.error("Could not save.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="font-display text-lg font-bold text-ink">Add a review</h2>
      <p className="mt-1 text-[13px] text-slate">
        Admin-entered reviews are published immediately.
      </p>

      <form onSubmit={submit} className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Author" error={fields.author} required>
            {(id) => (
              <Input
                id={id}
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Marcus T."
              />
            )}
          </Field>
          <Field label="Trip" error={fields.trip}>
            {(id) => (
              <Input
                id={id}
                value={trip}
                onChange={(e) => setTrip(e.target.value)}
                placeholder="Sikkim Explorer"
              />
            )}
          </Field>
          <Field label="Rating" error={fields.rating} required>
            {(id) => (
              <Select
                id={id}
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} star{value === 1 ? "" : "s"}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>

        <Field label="Quote" error={fields.quote} required>
          {(id) => (
            <Textarea
              id={id}
              required
              rows={3}
              maxLength={600}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="An authentic glimpse into Himalayan life…"
            />
          )}
        </Field>

        <Button type="submit" loading={saving}>
          Publish review
        </Button>
      </form>
    </Card>
  );
}

export default function ReviewsPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <ReviewsInner />
    </Suspense>
  );
}
