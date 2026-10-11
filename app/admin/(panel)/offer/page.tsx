"use client";

import { useState } from "react";

import { ImageUploader, type AdminImage } from "@/components/admin/ImageUploader";
import { useToast } from "@/components/admin/Toast";
import {
  Badge,
  Button,
  Card,
  ErrorState,
  Field,
  Input,
  PageHeader,
  Select,
  Spinner,
  Textarea,
  Toggle,
} from "@/components/admin/ui";
import { ApiClientError, api, type ApiFieldErrors } from "@/lib/admin/api";
import { useResource } from "@/lib/admin/useResource";

type OfferRow = {
  isActive: boolean;
  badge?: string;
  title?: string;
  description?: string;
  image?: AdminImage;
  couponCode?: string;
  ctaLabel?: string;
  ctaHref?: string;
  showOn?: "home" | "all";
  frequency?: "visit" | "session" | "day";
  delaySeconds?: number;
  startsAt?: string;
  endsAt?: string;
};

/** <input type="datetime-local"> speaks local time without a zone. */
function toLocalInput(iso?: string) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const fromLocalInput = (value: string) => (value ? new Date(value).toISOString() : null);

export default function OfferAdminPage() {
  const { data, loading, error, reload } = useResource<OfferRow | null>("/api/admin/offer");

  return (
    <div className="space-y-8">
      <PageHeader
        title="Offer popup"
        description="A promotional popup that opens when visitors land on the site. Save, then open the site in a private window to see it."
      />

      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {/* data === null is a valid answer: no offer has been saved yet. */}
      {!loading && !error && data !== undefined && <OfferForm initial={data} />}
    </div>
  );
}

function OfferForm({ initial }: { initial: OfferRow | null }) {
  const toast = useToast();

  const [isActive, setIsActive] = useState(initial?.isActive ?? false);
  const [badge, setBadge] = useState(initial?.badge ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [image, setImage] = useState<AdminImage | null>(initial?.image ?? null);
  const [couponCode, setCouponCode] = useState(initial?.couponCode ?? "");
  const [ctaLabel, setCtaLabel] = useState(initial?.ctaLabel ?? "");
  const [ctaHref, setCtaHref] = useState(initial?.ctaHref ?? "");
  const [showOn, setShowOn] = useState<"home" | "all">(initial?.showOn ?? "home");
  const [frequency, setFrequency] = useState<"visit" | "session" | "day">(
    initial?.frequency ?? "session",
  );
  const [delaySeconds, setDelaySeconds] = useState(initial?.delaySeconds ?? 2);
  const [startsAt, setStartsAt] = useState(toLocalInput(initial?.startsAt));
  const [endsAt, setEndsAt] = useState(toLocalInput(initial?.endsAt));

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<ApiFieldErrors>({});

  const save = async () => {
    const local: ApiFieldErrors = {};
    if (isActive && title.trim().length < 3) local.title = "A title is needed before the popup can go live";
    if (ctaLabel.trim() && !ctaHref.trim()) local.ctaHref = "Add a link for the button";
    if (image && !image.alt.trim()) local.image = "Add alt text for the image";
    setErrors(local);
    if (Object.keys(local).length) return;

    setSaving(true);
    try {
      await api.put("/api/admin/offer", {
        isActive,
        badge: badge.trim(),
        title: title.trim(),
        description: description.trim(),
        image,
        couponCode: couponCode.trim(),
        ctaLabel: ctaLabel.trim(),
        ctaHref: ctaHref.trim(),
        showOn,
        frequency,
        delaySeconds,
        startsAt: fromLocalInput(startsAt),
        endsAt: fromLocalInput(endsAt),
      });
      toast.success(isActive ? "Saved — the popup is live" : "Saved — the popup is switched off");
    } catch (e) {
      if (e instanceof ApiClientError) {
        setErrors(e.fields ?? {});
        toast.error(e.message);
      } else {
        toast.error("Something went wrong. Try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Toggle
            checked={isActive}
            onChange={setIsActive}
            label="Show the popup on the site"
            description="Off keeps your content saved without showing it."
          />
          <Badge tone={isActive ? "success" : "neutral"}>{isActive ? "Live" : "Off"}</Badge>
        </div>
      </Card>

      <Card className="grid gap-5 p-5">
        <h2 className="font-display text-lg font-bold text-ink">Content</h2>

        <Field label="Small label" hint="e.g. Limited time · Festive offer. Optional." error={errors.badge}>
          {(id) => <Input id={id} maxLength={40} value={badge} onChange={(e) => setBadge(e.target.value)} />}
        </Field>

        <Field label="Title" required={isActive} error={errors.title}>
          {(id) => (
            <Input
              id={id}
              maxLength={90}
              value={title}
              placeholder="Flat 15% off Darjeeling & Sikkim packages"
              onChange={(e) => setTitle(e.target.value)}
            />
          )}
        </Field>

        <Field label="Message" hint="A sentence or two. Optional." error={errors.description}>
          {(id) => (
            <Textarea
              id={id}
              rows={3}
              maxLength={400}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          )}
        </Field>

        <div>
          <ImageUploader
            folder="offers"
            label="Image (optional)"
            requireAlt
            value={image}
            onChange={setImage}
          />
          {errors.image && (
            <p role="alert" className="mt-1.5 text-[12px] font-medium text-red-600">
              {errors.image}
            </p>
          )}
        </div>

        <Field label="Coupon code" hint="Shown with a tap-to-copy button. Optional." error={errors.couponCode}>
          {(id) => (
            <Input
              id={id}
              maxLength={30}
              value={couponCode}
              placeholder="HEAVEN15"
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            />
          )}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Button text" hint="Leave empty for no button." error={errors.ctaLabel}>
            {(id) => <Input id={id} maxLength={40} value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} />}
          </Field>
          <Field label="Button link" hint="/packages or https://…" error={errors.ctaHref}>
            {(id) => (
              <Input
                id={id}
                value={ctaHref}
                placeholder="/packages"
                onChange={(e) => setCtaHref(e.target.value)}
              />
            )}
          </Field>
        </div>
      </Card>

      <Card className="grid gap-5 p-5">
        <h2 className="font-display text-lg font-bold text-ink">When it appears</h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Pages" error={errors.showOn}>
            {(id) => (
              <Select id={id} value={showOn} onChange={(e) => setShowOn(e.target.value as "home" | "all")}>
                <option value="home">Home page only</option>
                <option value="all">Every page</option>
              </Select>
            )}
          </Field>

          <Field label="How often" error={errors.frequency}>
            {(id) => (
              <Select
                id={id}
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as "visit" | "session" | "day")}
              >
                <option value="session">Once per visit (session)</option>
                <option value="day">Once a day</option>
                <option value="visit">Every page load</option>
              </Select>
            )}
          </Field>

          <Field label="Delay (seconds)" hint="0 to 30" error={errors.delaySeconds}>
            {(id) => (
              <Input
                id={id}
                type="number"
                min={0}
                max={30}
                value={delaySeconds}
                onChange={(e) =>
                  setDelaySeconds(Math.min(30, Math.max(0, Math.round(Number(e.target.value) || 0))))
                }
              />
            )}
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Starts" hint="Optional — show from this time." error={errors.startsAt}>
            {(id) => (
              <Input id={id} type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            )}
          </Field>
          <Field label="Ends" hint="Optional — hide after this time." error={errors.endsAt}>
            {(id) => (
              <Input id={id} type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
            )}
          </Field>
        </div>

        <p className="text-[12px] text-slate">
          Editing the offer shows it again to visitors who had already closed the old one.
        </p>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} loading={saving}>
          Save offer
        </Button>
      </div>
    </div>
  );
}
