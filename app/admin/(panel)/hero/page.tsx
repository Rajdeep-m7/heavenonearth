"use client";

import { useState } from "react";

import { ImageUploader, type AdminImage } from "@/components/admin/ImageUploader";
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
  Spinner,
  Textarea,
  Toggle,
} from "@/components/admin/ui";
import { ApiClientError, api, type ApiFieldErrors } from "@/lib/admin/api";
import { useResource } from "@/lib/admin/useResource";

type SlideRow = {
  _id: string;
  image: AdminImage;
  headline: string;
  subheading: string;
  ctaLabel: string;
  ctaHref: string;
  order: number;
  isActive: boolean;
};

type SlideBody = Omit<SlideRow, "_id" | "order">;

const NEW_SLIDE_DEFAULTS: Pick<SlideBody, "headline" | "subheading" | "ctaLabel" | "ctaHref"> = {
  headline: "Find Your Own\nPiece of Heaven.",
  subheading: "The Himalayas",
  ctaLabel: "Explore Destinations",
  ctaHref: "/destinations",
};

/** Server validation arrives as { field: message }; anything else is a toast. */
function readError(error: unknown): { message: string; fields: ApiFieldErrors } {
  if (error instanceof ApiClientError) {
    return { message: error.message, fields: error.fields ?? {} };
  }
  return { message: "Something went wrong. Try again.", fields: {} };
}

export default function HeroAdminPage() {
  const toast = useToast();
  const { data, meta, loading, error, reload } = useResource<SlideRow[]>("/api/admin/hero");
  const [adding, setAdding] = useState(false);

  const max = Number(meta?.max ?? 10);
  const slides = data ?? [];
  const full = slides.length >= max;

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= slides.length) return;

    const ids = slides.map((slide) => slide._id);
    [ids[index], ids[target]] = [ids[target], ids[index]];

    try {
      await api.patch("/api/admin/hero/reorder", { order: ids });
      await reload();
    } catch (e) {
      toast.error(readError(e).message);
    }
  };

  const remove = async (slide: SlideRow) => {
    if (!confirm("Delete this slide? Its image will be removed too.")) return;
    try {
      await api.del(`/api/admin/hero/${slide._id}`);
      toast.success("Slide deleted");
      await reload();
    } catch (e) {
      toast.error(readError(e).message);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Hero banner"
        description="The large banner at the top of the home page. Add more than one slide and it becomes an auto-playing slider."
        action={
          <Button onClick={() => setAdding(true)} disabled={adding || full}>
            Add slide
          </Button>
        }
      />

      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && slides.length === 0 && !adding && (
        <EmptyState
          title="Showing the default banner"
          description="No slides yet, so the site displays the built-in Darjeeling banner. Add a slide to replace it."
          action={<Button onClick={() => setAdding(true)}>Add first slide</Button>}
        />
      )}

      {adding && (
        <SlideEditor
          title="New slide"
          initial={null}
          onCancel={() => setAdding(false)}
          onSave={async (body) => {
            await api.post("/api/admin/hero", { ...body, order: slides.length });
            toast.success("Slide added");
            setAdding(false);
            await reload();
          }}
        />
      )}

      {slides.length > 0 && (
        <>
          {slides.length === 1 && (
            <p className="rounded-xl bg-ice px-4 py-3 text-[14px] text-teal-deep">
              One slide shows as a plain banner. Add a second to turn on the slider.
            </p>
          )}
          <div className="grid gap-6 lg:grid-cols-2">
            {slides.map((slide, index) => (
              <SlideEditor
                key={slide._id}
                title={`Slide ${index + 1}`}
                initial={slide}
                onMoveUp={index > 0 ? () => move(index, -1) : undefined}
                onMoveDown={index < slides.length - 1 ? () => move(index, 1) : undefined}
                onDelete={() => remove(slide)}
                onSave={async (body) => {
                  await api.patch(`/api/admin/hero/${slide._id}`, body);
                  toast.success("Slide saved");
                  await reload();
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SlideEditor({
  title,
  initial,
  onSave,
  onCancel,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  title: string;
  initial: SlideRow | null;
  onSave: (body: SlideBody) => Promise<void>;
  onCancel?: () => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const toast = useToast();
  const seed = initial ?? { ...NEW_SLIDE_DEFAULTS, image: null, isActive: true };

  const [image, setImage] = useState<AdminImage | null>(seed.image);
  const [headline, setHeadline] = useState(seed.headline);
  const [subheading, setSubheading] = useState(seed.subheading);
  const [ctaLabel, setCtaLabel] = useState(seed.ctaLabel);
  const [ctaHref, setCtaHref] = useState(seed.ctaHref);
  const [isActive, setIsActive] = useState(seed.isActive);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<ApiFieldErrors>({});

  const save = async () => {
    const local: ApiFieldErrors = {};
    if (!image) local.image = "Upload a banner image";
    else if (!image.alt.trim()) local.image = "Add alt text for the image";
    if (headline.trim().length < 3) local.headline = "At least 3 characters";
    if (ctaLabel.trim() && !ctaHref.trim()) local.ctaHref = "Add a link for the button";
    setErrors(local);
    if (Object.keys(local).length || !image) return;

    setSaving(true);
    try {
      await onSave({
        image,
        headline: headline.trim(),
        subheading: subheading.trim(),
        ctaLabel: ctaLabel.trim(),
        ctaHref: ctaHref.trim(),
        isActive,
      });
      setErrors({});
    } catch (e) {
      const { message, fields } = readError(e);
      setErrors(fields);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="flex flex-col gap-5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
          {initial && <Badge tone={isActive ? "success" : "neutral"}>{isActive ? "Live" : "Hidden"}</Badge>}
        </div>
        {(onMoveUp || onMoveDown) && (
          <div className="flex gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={onMoveUp}
              disabled={!onMoveUp}
              aria-label="Move slide earlier"
            >
              ↑ Earlier
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onMoveDown}
              disabled={!onMoveDown}
              aria-label="Move slide later"
            >
              ↓ Later
            </Button>
          </div>
        )}
      </div>

      <div>
        <ImageUploader folder="hero" label="Banner image" value={image} onChange={setImage} />
        {errors.image && (
          <p role="alert" className="mt-1.5 text-[12px] font-medium text-red-600">
            {errors.image}
          </p>
        )}
      </div>

      <Field
        label="Headline"
        required
        hint="Press Enter for a new line."
        error={errors.headline}
      >
        {(id) => (
          <Textarea
            id={id}
            rows={2}
            maxLength={90}
            value={headline}
            onChange={(event) => setHeadline(event.target.value)}
          />
        )}
      </Field>

      <Field label="Sub-heading" hint="Small gold line under the headline. Optional." error={errors.subheading}>
        {(id) => (
          <Input
            id={id}
            maxLength={60}
            value={subheading}
            onChange={(event) => setSubheading(event.target.value)}
          />
        )}
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Button text" hint="Leave empty for no button." error={errors.ctaLabel}>
          {(id) => (
            <Input
              id={id}
              maxLength={40}
              value={ctaLabel}
              onChange={(event) => setCtaLabel(event.target.value)}
            />
          )}
        </Field>
        <Field label="Button link" hint="/packages or https://…" error={errors.ctaHref}>
          {(id) => (
            <Input
              id={id}
              value={ctaHref}
              placeholder="/destinations"
              onChange={(event) => setCtaHref(event.target.value)}
            />
          )}
        </Field>
      </div>

      <Toggle
        checked={isActive}
        onChange={setIsActive}
        label="Show on the site"
        description="Turn off to keep the slide saved but hidden."
      />

      <div className="flex items-center justify-between border-t border-black/8 pt-4">
        {onDelete ? (
          <Button variant="danger" size="sm" onClick={onDelete}>
            Delete
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button size="sm" onClick={save} loading={saving}>
          {initial ? "Save changes" : "Add slide"}
        </Button>
      </div>
    </Card>
  );
}
