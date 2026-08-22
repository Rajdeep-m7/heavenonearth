"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  ImageListUploader,
  ImageUploader,
  type AdminImage,
} from "@/components/admin/ImageUploader";
import { useToast } from "@/components/admin/Toast";
import {
  Button,
  Card,
  ChipsInput,
  Field,
  Input,
  PageHeader,
  Select,
  Textarea,
  Toggle,
} from "@/components/admin/ui";
import { ApiClientError, api } from "@/lib/admin/api";
import { useResource } from "@/lib/admin/useResource";

type ItineraryDay = { day: number; title: string; detail: string };

export type PackageDraft = {
  _id?: string;
  category: string;
  title: string;
  summary: string;
  description: string;
  destination: string;
  days: number;
  nights: number;
  priceFrom: number;
  inclusions: string[];
  exclusions: string[];
  itinerary: ItineraryDay[];
  coverImage: AdminImage | null;
  images: AdminImage[];
  badge: "bestSeller" | "newJourney" | "none";
  isFeatured: boolean;
  isActive: boolean;
  order: number;
};

export const blankPackage: PackageDraft = {
  category: "",
  title: "",
  summary: "",
  description: "",
  destination: "",
  days: 4,
  nights: 3,
  priceFrom: 0,
  inclusions: [],
  exclusions: [],
  itinerary: [],
  coverImage: null,
  images: [],
  badge: "none",
  isFeatured: false,
  isActive: true,
  order: 0,
};

export function PackageEditor({ initial }: { initial: PackageDraft }) {
  const router = useRouter();
  const toast = useToast();
  const { data: categories } = useResource<
    { _id: string; name: string }[]
  >("/api/admin/categories");

  const [draft, setDraft] = useState<PackageDraft>(initial);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof PackageDraft>(key: K, value: PackageDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const addDay = () =>
    set("itinerary", [
      ...draft.itinerary,
      { day: draft.itinerary.length + 1, title: "", detail: "" },
    ]);

  const updateDay = (index: number, patch: Partial<ItineraryDay>) => {
    const next = [...draft.itinerary];
    next[index] = { ...next[index], ...patch };
    set("itinerary", next);
  };

  const removeDay = (index: number) =>
    set(
      "itinerary",
      draft.itinerary
        .filter((_, i) => i !== index)
        // Renumber so the days stay 1..n after a removal.
        .map((day, i) => ({ ...day, day: i + 1 })),
    );

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setFields({});

    if (!draft.coverImage) {
      toast.error("A cover image is required.");
      return;
    }
    if (!draft.coverImage.alt.trim()) {
      toast.error("Add alt text to the cover image.");
      return;
    }
    if (draft.nights > draft.days) {
      setFields({ nights: "Nights cannot exceed days" });
      toast.error("Nights cannot exceed days.");
      return;
    }

    const body = {
      category: draft.category,
      title: draft.title,
      summary: draft.summary,
      description: draft.description || undefined,
      destination: draft.destination || undefined,
      days: draft.days,
      nights: draft.nights,
      priceFrom: draft.priceFrom,
      inclusions: draft.inclusions,
      exclusions: draft.exclusions,
      itinerary: draft.itinerary.filter((day) => day.title.trim()),
      coverImage: draft.coverImage,
      images: draft.images,
      badge: draft.badge,
      isFeatured: draft.isFeatured,
      isActive: draft.isActive,
      order: draft.order,
    };

    setSaving(true);
    try {
      if (draft._id) {
        await api.patch(`/api/packages/${draft._id}`, body);
        toast.success("Package saved.");
      } else {
        await api.post("/api/packages", body);
        toast.success("Package created.");
      }
      router.push("/admin/packages");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setFields(err.fields ?? {});
        toast.error(err.message);
      } else {
        toast.error("Could not save. Try again.");
      }
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-8">
      <PageHeader
        title={draft._id ? "Edit package" : "New package"}
        description="Curated journeys shown under “Journeys Made For You”."
        action={
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/admin/packages")}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {draft._id ? "Save changes" : "Create package"}
            </Button>
          </div>
        }
      />

      <Card className="space-y-5 p-6">
        <h2 className="font-display text-lg font-bold text-ink">Basics</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Title" error={fields.title} required>
            {(id) => (
              <Input
                id={id}
                required
                value={draft.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Darjeeling Tea & Mountain Escape"
              />
            )}
          </Field>

          <Field label="Master package" error={fields.category} required>
            {(id) => (
              <Select
                id={id}
                required
                value={draft.category}
                onChange={(e) => set("category", e.target.value)}
              >
                <option value="">Choose one…</option>
                {(categories ?? []).map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>

        <Field
          label="Summary"
          error={fields.summary}
          hint="One or two lines, shown on the card. Max 300 characters."
          required
        >
          {(id) => (
            <Textarea
              id={id}
              required
              rows={2}
              maxLength={300}
              value={draft.summary}
              onChange={(e) => set("summary", e.target.value)}
              placeholder="Tea gardens, misty mornings and unforgettable Himalayan views."
            />
          )}
        </Field>

        <Field label="Full description" error={fields.description}>
          {(id) => (
            <Textarea
              id={id}
              rows={6}
              value={draft.description}
              onChange={(e) => set("description", e.target.value)}
            />
          )}
        </Field>

        <Field label="Destination" error={fields.destination}>
          {(id) => (
            <Input
              id={id}
              value={draft.destination}
              onChange={(e) => set("destination", e.target.value)}
              placeholder="Darjeeling, West Bengal"
            />
          )}
        </Field>
      </Card>

      <Card className="space-y-5 p-6">
        <h2 className="font-display text-lg font-bold text-ink">
          Duration &amp; price
        </h2>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Days" error={fields.days} required>
            {(id) => (
              <Input
                id={id}
                type="number"
                min={1}
                required
                value={draft.days}
                onChange={(e) => set("days", Number(e.target.value))}
              />
            )}
          </Field>
          <Field label="Nights" error={fields.nights} required>
            {(id) => (
              <Input
                id={id}
                type="number"
                min={0}
                required
                value={draft.nights}
                onChange={(e) => set("nights", Number(e.target.value))}
              />
            )}
          </Field>
          <Field
            label="From (₹ per person)"
            error={fields.priceFrom}
            required
          >
            {(id) => (
              <Input
                id={id}
                type="number"
                min={0}
                required
                value={draft.priceFrom}
                onChange={(e) => set("priceFrom", Number(e.target.value))}
              />
            )}
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Inclusions" hint="Enter or comma to add each one.">
            {(id) => (
              <ChipsInput
                id={id}
                value={draft.inclusions}
                onChange={(v) => set("inclusions", v)}
                placeholder="Stay, Breakfast, Local Transfers"
              />
            )}
          </Field>
          <Field label="Exclusions">
            {(id) => (
              <ChipsInput
                id={id}
                value={draft.exclusions}
                onChange={(v) => set("exclusions", v)}
                placeholder="Flights, Personal expenses"
              />
            )}
          </Field>
        </div>
      </Card>

      <Card className="space-y-5 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink">Itinerary</h2>
          <Button type="button" variant="secondary" size="sm" onClick={addDay}>
            Add day
          </Button>
        </div>

        {draft.itinerary.length === 0 ? (
          <p className="rounded-xl border border-dashed border-black/15 px-4 py-6 text-center text-[13px] text-slate">
            No days added yet. Optional, but it makes the package page much
            stronger.
          </p>
        ) : (
          <ul className="space-y-3">
            {draft.itinerary.map((day, index) => (
              <li
                key={index}
                className="rounded-xl border border-black/10 bg-black/[0.015] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-teal px-3 py-1 text-[12px] font-bold text-white">
                    Day {day.day}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeDay(index)}
                    className="text-[13px] font-medium text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-3 space-y-2.5">
                  <Input
                    value={day.title}
                    onChange={(e) => updateDay(index, { title: e.target.value })}
                    placeholder="Arrive in Darjeeling"
                  />
                  <Textarea
                    rows={2}
                    value={day.detail}
                    onChange={(e) => updateDay(index, { detail: e.target.value })}
                    placeholder="What happens on this day…"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="space-y-6 p-6">
        <h2 className="font-display text-lg font-bold text-ink">Images</h2>
        <ImageUploader
          folder="packages"
          label="Cover image"
          value={draft.coverImage}
          onChange={(image) => set("coverImage", image)}
        />
        <ImageListUploader
          folder="packages"
          value={draft.images}
          onChange={(images) => set("images", images)}
        />
      </Card>

      <Card className="space-y-5 p-6">
        <h2 className="font-display text-lg font-bold text-ink">Visibility</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Ribbon">
            {(id) => (
              <Select
                id={id}
                value={draft.badge}
                onChange={(e) =>
                  set("badge", e.target.value as PackageDraft["badge"])
                }
              >
                <option value="none">No ribbon</option>
                <option value="bestSeller">Best Seller</option>
                <option value="newJourney">New Journey</option>
              </Select>
            )}
          </Field>
          <Field label="Sort order" hint="Lower numbers appear first.">
            {(id) => (
              <Input
                id={id}
                type="number"
                value={draft.order}
                onChange={(e) => set("order", Number(e.target.value))}
              />
            )}
          </Field>
        </div>

        <Toggle
          checked={draft.isFeatured}
          onChange={(v) => set("isFeatured", v)}
          label="Feature on the home page"
          description="Shows under “Journeys Made For You”. Two work best."
        />
        <Toggle
          checked={draft.isActive}
          onChange={(v) => set("isActive", v)}
          label="Live on the site"
        />
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/packages")}
        >
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          {draft._id ? "Save changes" : "Create package"}
        </Button>
      </div>
    </form>
  );
}
