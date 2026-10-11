"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  ImageListUploader,
  ImageUploader,
  type AdminImage,
} from "@/components/admin/ImageUploader";
import { RoomsPanel } from "@/components/admin/RoomsPanel";
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

export type StayDraft = {
  _id?: string;
  name: string;
  category: string;
  summary: string;
  description: string;
  propertyType: "homestay" | "resort" | "cottage" | "teaBungalow" | "camp";
  location: { address: string; locality: string; region: string };
  amenities: string[];
  houseRules: string[];
  cancellationPolicy: string;
  checkInTime: string;
  checkOutTime: string;
  host: { name: string; bio: string; tags: string[] };
  coverImage: AdminImage | null;
  images: AdminImage[];
  highlights: string[];
  isFeatured: boolean;
  isActive: boolean;
  order: number;
};

export const blankStay: StayDraft = {
  name: "",
  category: "",
  summary: "",
  description: "",
  propertyType: "homestay",
  location: { address: "", locality: "", region: "West Bengal" },
  amenities: [],
  houseRules: [],
  cancellationPolicy: "",
  checkInTime: "12:00",
  checkOutTime: "11:00",
  host: { name: "", bio: "", tags: [] },
  coverImage: null,
  images: [],
  highlights: [],
  isFeatured: false,
  isActive: true,
  order: 0,
};

const PROPERTY_TYPES = [
  { value: "homestay", label: "Homestay" },
  { value: "resort", label: "Resort" },
  { value: "cottage", label: "Cottage" },
  { value: "teaBungalow", label: "Tea bungalow" },
  { value: "camp", label: "Camp" },
] as const;

export function StayEditor({ initial }: { initial: StayDraft }) {
  const router = useRouter();
  const toast = useToast();
  const { data: categories } = useResource<
    { _id: string; name: string }[]
  >("/api/admin/categories");

  const [draft, setDraft] = useState<StayDraft>(initial);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof StayDraft>(key: K, value: StayDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

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

    const body = {
      name: draft.name,
      category: draft.category || undefined,
      summary: draft.summary,
      description: draft.description || undefined,
      propertyType: draft.propertyType,
      location: {
        address: draft.location.address || undefined,
        locality: draft.location.locality || undefined,
        region: draft.location.region || undefined,
        country: "IN",
      },
      amenities: draft.amenities,
      houseRules: draft.houseRules,
      cancellationPolicy: draft.cancellationPolicy || undefined,
      checkInTime: draft.checkInTime,
      checkOutTime: draft.checkOutTime,
      host: draft.host.name
        ? {
            name: draft.host.name,
            bio: draft.host.bio || undefined,
            tags: draft.host.tags,
          }
        : undefined,
      coverImage: draft.coverImage,
      images: draft.images,
      highlights: draft.highlights,
      isFeatured: draft.isFeatured,
      isActive: draft.isActive,
      order: draft.order,
    };

    setSaving(true);
    try {
      if (draft._id) {
        await api.patch(`/api/stays/${draft._id}`, body);
        toast.success("Stay saved.");
        setSaving(false);
      } else {
        const created = await api.post<{ _id: string }>("/api/stays", body);
        toast.success("Stay created — now add its rooms.");
        // Straight into the editor so rooms can be added immediately.
        router.replace(`/admin/stays/${created.data._id}`);
        router.refresh();
      }
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
    <div className="space-y-8">
      <form onSubmit={save} className="space-y-8">
        <PageHeader
          title={draft._id ? "Edit stay" : "New stay"}
          description="Properties shown under “Stay Like You Belong Here”. Cover image displays in 4:3 landscape."
          action={
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/admin/stays")}
              >
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                {draft._id ? "Save changes" : "Create stay"}
              </Button>
            </div>
          }
        />

        <Card className="space-y-5 p-6">
          <h2 className="font-display text-lg font-bold text-ink">Basics</h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name" error={fields.name} required>
              {(id) => (
                <Input
                  id={id}
                  required
                  value={draft.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="The Misty Pine Retreat"
                />
              )}
            </Field>

            <Field label="Property type">
              {(id) => (
                <Select
                  id={id}
                  value={draft.propertyType}
                  onChange={(e) =>
                    set("propertyType", e.target.value as StayDraft["propertyType"])
                  }
                >
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>

          <Field label="Master package" hint="Optional grouping.">
            {(id) => (
              <Select
                id={id}
                value={draft.category}
                onChange={(e) => set("category", e.target.value)}
              >
                <option value="">None</option>
                {(categories ?? []).map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field label="Summary" error={fields.summary} required>
            {(id) => (
              <Textarea
                id={id}
                required
                rows={2}
                maxLength={300}
                value={draft.summary}
                onChange={(e) => set("summary", e.target.value)}
                placeholder="A secluded sanctuary nestled deep within ancient pine forests."
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
        </Card>

        <Card className="space-y-5 p-6">
          <h2 className="font-display text-lg font-bold text-ink">Location</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Town / locality">
              {(id) => (
                <Input
                  id={id}
                  value={draft.location.locality}
                  onChange={(e) =>
                    set("location", { ...draft.location, locality: e.target.value })
                  }
                  placeholder="Darjeeling"
                />
              )}
            </Field>
            <Field label="State / region">
              {(id) => (
                <Input
                  id={id}
                  value={draft.location.region}
                  onChange={(e) =>
                    set("location", { ...draft.location, region: e.target.value })
                  }
                  placeholder="West Bengal"
                />
              )}
            </Field>
          </div>
          <Field label="Address">
            {(id) => (
              <Input
                id={id}
                value={draft.location.address}
                onChange={(e) =>
                  set("location", { ...draft.location, address: e.target.value })
                }
              />
            )}
          </Field>
        </Card>

        <Card className="space-y-5 p-6">
          <h2 className="font-display text-lg font-bold text-ink">
            Amenities &amp; policies
          </h2>

          <Field label="Amenities">
            {(id) => (
              <ChipsInput
                id={id}
                value={draft.amenities}
                onChange={(v) => set("amenities", v)}
                placeholder="High-speed Wi-Fi, Indoor Fireplace, Guided Trails"
              />
            )}
          </Field>

          <Field label="Highlights" hint="Short badges shown on the card.">
            {(id) => (
              <ChipsInput
                id={id}
                value={draft.highlights}
                onChange={(v) => set("highlights", v)}
                placeholder="Mountain View, Cozy Fire"
              />
            )}
          </Field>

          <Field label="House rules">
            {(id) => (
              <ChipsInput
                id={id}
                value={draft.houseRules}
                onChange={(v) => set("houseRules", v)}
                placeholder="No smoking indoors"
              />
            )}
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Check-in time">
              {(id) => (
                <Input
                  id={id}
                  type="time"
                  value={draft.checkInTime}
                  onChange={(e) => set("checkInTime", e.target.value)}
                />
              )}
            </Field>
            <Field label="Check-out time">
              {(id) => (
                <Input
                  id={id}
                  type="time"
                  value={draft.checkOutTime}
                  onChange={(e) => set("checkOutTime", e.target.value)}
                />
              )}
            </Field>
          </div>

          <Field label="Cancellation policy">
            {(id) => (
              <Textarea
                id={id}
                rows={3}
                value={draft.cancellationPolicy}
                onChange={(e) => set("cancellationPolicy", e.target.value)}
                placeholder="Free cancellation up to 48 hours before check-in…"
              />
            )}
          </Field>
        </Card>

        <Card className="space-y-5 p-6">
          <h2 className="font-display text-lg font-bold text-ink">Host</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Host name">
              {(id) => (
                <Input
                  id={id}
                  value={draft.host.name}
                  onChange={(e) =>
                    set("host", { ...draft.host, name: e.target.value })
                  }
                  placeholder="Anjali"
                />
              )}
            </Field>
            <Field label="Host tags">
              {(id) => (
                <ChipsInput
                  id={id}
                  value={draft.host.tags}
                  onChange={(tags) => set("host", { ...draft.host, tags })}
                  placeholder="Superhost, Local guide"
                />
              )}
            </Field>
          </div>
          <Field label="Host bio">
            {(id) => (
              <Textarea
                id={id}
                rows={3}
                value={draft.host.bio}
                onChange={(e) => set("host", { ...draft.host, bio: e.target.value })}
                placeholder="My family has lived on these hills for generations…"
              />
            )}
          </Field>
        </Card>

        <Card className="space-y-6 p-6">
          <h2 className="font-display text-lg font-bold text-ink">Images</h2>
          <ImageUploader
            folder="stays"
            label="Cover image"
            value={draft.coverImage}
            onChange={(image) => set("coverImage", image)}
          />
          <ImageListUploader
            folder="stays"
            value={draft.images}
            onChange={(images) => set("images", images)}
          />
        </Card>

        <Card className="space-y-5 p-6">
          <h2 className="font-display text-lg font-bold text-ink">Visibility</h2>
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
          <Toggle
            checked={draft.isFeatured}
            onChange={(v) => set("isFeatured", v)}
            label="Feature on the home page"
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
            onClick={() => router.push("/admin/stays")}
          >
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {draft._id ? "Save changes" : "Create stay"}
          </Button>
        </div>
      </form>

      {/* Rooms only exist once the stay does. */}
      {draft._id ? (
        <RoomsPanel stayId={draft._id} />
      ) : (
        <Card className="p-6">
          <h2 className="font-display text-lg font-bold text-ink">Rooms</h2>
          <p className="mt-2 text-[14px] text-slate">
            Save the stay first — then you can add its rooms here.
          </p>
        </Card>
      )}
    </div>
  );
}
