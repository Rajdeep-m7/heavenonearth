"use client";

import { useRef, useState } from "react";

import { Button, Input } from "@/components/admin/ui";
import { useToast } from "@/components/admin/Toast";
import { api, uploadToCloudinary } from "@/lib/admin/api";

export type AdminImage = {
  publicId: string;
  url: string;
  width: number;
  height: number;
  alt: string;
};

const MAX_BYTES = 10 * 1024 * 1024;

type Props = {
  folder: "categories" | "packages" | "stays" | "rooms" | "gallery" | "reviews" | "trending" | "hero" | "offers";
  value: AdminImage | null;
  onChange: (image: AdminImage | null) => void;
  label?: string;
  /** Alt text is an SEO and accessibility asset — required by default. */
  requireAlt?: boolean;
};

/** Preview works for both Cloudinary publicIds and local /images/... paths. */
export function previewSrc(image: { publicId: string; url: string }, width = 600) {
  if (image.publicId.startsWith("/") || image.publicId.startsWith("http")) {
    if (image.publicId.includes("images.unsplash.com")) {
      try {
        const u = new URL(image.publicId);
        u.searchParams.set("w", "1200");
        u.searchParams.set("q", "85");
        u.searchParams.set("auto", "format");
        u.searchParams.set("fit", "crop");
        return u.toString();
      } catch {
        return image.publicId;
      }
    }
    return image.publicId;
  }
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return cloud
    ? `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto:best,dpr_auto,w_${Math.max(width * 2, 800)},c_limit/${image.publicId}`
    : image.url;
}

export const FOLDER_RATIO_CONFIG: Record<
  Props["folder"],
  {
    ratio: string;
    shape: string;
    dimensions: string;
    /** Below this width the photo is stretched on retina screens and looks soft. */
    minWidth: number;
    containerClass: string;
  }
> = {
  hero: {
    ratio: "16 : 9",
    shape: "Wide Landscape",
    dimensions: "2400 × 1350 (keep the subject left-of-centre, text sits on the left)",
    minWidth: 1920,
    containerClass: "w-full max-w-sm aspect-video rounded-xl",
  },
  offers: {
    ratio: "3 : 2",
    shape: "Landscape",
    dimensions: "1200 × 800",
    minWidth: 900,
    containerClass: "w-48 aspect-[3/2] rounded-xl",
  },
  trending: {
    ratio: "290 : 421 (~2:3)",
    shape: "Portrait Arch",
    dimensions: "600 × 870 or 1200 × 1740",
    minWidth: 600,
    containerClass: "w-32 aspect-[290/421] rounded-2xl",
  },
  gallery: {
    ratio: "4 : 5",
    shape: "Portrait",
    dimensions: "800 × 1000 or 1200 × 1500",
    minWidth: 800,
    containerClass: "w-32 aspect-[4/5] rounded-xl",
  },
  packages: {
    ratio: "4 : 3",
    shape: "Landscape",
    dimensions: "1200 × 900",
    minWidth: 1200,
    containerClass: "w-44 aspect-[4/3] rounded-xl",
  },
  stays: {
    ratio: "4 : 3",
    shape: "Landscape",
    dimensions: "1200 × 900",
    minWidth: 1200,
    containerClass: "w-44 aspect-[4/3] rounded-xl",
  },
  categories: {
    ratio: "4 : 3",
    shape: "Landscape",
    dimensions: "1200 × 900",
    minWidth: 1200,
    containerClass: "w-44 aspect-[4/3] rounded-xl",
  },
  rooms: {
    ratio: "4 : 3",
    shape: "Landscape",
    dimensions: "1200 × 900",
    minWidth: 1200,
    containerClass: "w-44 aspect-[4/3] rounded-xl",
  },
  reviews: {
    ratio: "1 : 1",
    shape: "Square Avatar",
    dimensions: "400 × 400",
    minWidth: 200,
    containerClass: "w-28 aspect-square rounded-full",
  },
};

export function ImageUploader({
  folder,
  value,
  onChange,
  label = "Image",
  requireAlt = true,
}: Props) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const ratioConfig = FOLDER_RATIO_CONFIG[folder] ?? {
    ratio: "4 : 3",
    shape: "Landscape",
    dimensions: "1200 × 900",
    minWidth: 1200,
    containerClass: "w-44 aspect-[4/3] rounded-xl",
  };

  const pick = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("That file is not an image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error(
        `That image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 10 MB — please resize it first.`,
      );
      return;
    }

    setProgress(0);
    try {
      const { data: signature } = await api.post<{
        signature: string;
        timestamp: number;
        apiKey: string;
        cloudName: string;
        folder: string;
      }>("/api/admin/upload/signature", { folder });

      const uploaded = await uploadToCloudinary(file, signature, setProgress);

      onChange({ ...uploaded, alt: value?.alt ?? "" });
      toast.success("Image uploaded. Add alt text before saving.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Upload failed. Try again.",
      );
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13px] font-semibold text-ink">{label}</p>
        <span className="inline-flex items-center gap-1 rounded-full bg-teal/10 px-2.5 py-0.5 text-[11px] font-medium text-teal-deep">
          <span className="font-semibold">Format:</span> {ratioConfig.ratio} ({ratioConfig.shape})
        </span>
      </div>

      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start">
        <div
          className={`relative grid shrink-0 place-items-center overflow-hidden border border-dashed border-black/15 bg-black/[0.02] ${ratioConfig.containerClass}`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewSrc(value)}
              alt={value.alt || "Selected image"}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-1 p-2 text-center">
              <span className="text-[11px] font-medium text-slate">
                No image yet
              </span>
              <span className="text-[10px] text-slate/75">
                {ratioConfig.ratio}
              </span>
            </div>
          )}

          {progress !== null && (
            <div className="absolute inset-0 grid place-items-center bg-ink/70 text-white">
              <div className="w-3/4">
                <div className="h-1.5 overflow-hidden rounded-full bg-white/25">
                  <div
                    className="h-full rounded-full bg-gold transition-[width]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-center text-[12px]">{progress}%</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2.5">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={progress !== null}
            >
              {value ? "Replace" : "Upload"}
            </Button>
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange(null)}
                disabled={progress !== null}
              >
                Remove
              </Button>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void pick(file);
            }}
          />

          {value && (
            <div>
              <label className="block text-[12px] font-semibold text-ink">
                Alt text{requireAlt && <span className="ml-1 text-red-600">*</span>}
              </label>
              <Input
                value={value.alt}
                onChange={(event) =>
                  onChange({ ...value, alt: event.target.value })
                }
                placeholder="Describe the photo for search engines and screen readers"
              />
              {requireAlt && !value.alt.trim() && (
                <p className="mt-1 text-[12px] text-red-600">
                  Alt text is required before you can save.
                </p>
              )}
            </div>
          )}

          {value && value.width < ratioConfig.minWidth && (
            <p
              role="status"
              className="rounded-lg bg-amber-50 px-3 py-2 text-[12px] font-medium text-amber-800"
            >
              This image is only {value.width}px wide. It will look soft on large or
              high-density screens — upload one at least {ratioConfig.minWidth}px wide.
            </p>
          )}

          <p className="text-[12px] text-slate">
            Recommended: <strong className="font-semibold text-charcoal">{ratioConfig.ratio} ({ratioConfig.shape})</strong> · {ratioConfig.dimensions}. JPG, PNG or WebP up to 10 MB.
          </p>
        </div>
      </div>
    </div>
  );
}

/** Multi-image variant for detail galleries. */
export function ImageListUploader({
  folder,
  value,
  onChange,
  label = "Gallery images",
}: {
  folder: Props["folder"];
  value: AdminImage[];
  onChange: (next: AdminImage[]) => void;
  label?: string;
}) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const addFiles = async (files: FileList) => {
    setBusy(true);
    try {
      const { data: signature } = await api.post<{
        signature: string;
        timestamp: number;
        apiKey: string;
        cloudName: string;
        folder: string;
      }>("/api/admin/upload/signature", { folder });

      const added: AdminImage[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/") || file.size > MAX_BYTES) {
          toast.error(`Skipped ${file.name} — not an image, or over 10 MB.`);
          continue;
        }
        const uploaded = await uploadToCloudinary(file, signature);
        added.push({ ...uploaded, alt: "" });
      }
      if (added.length) {
        onChange([...value, ...added]);
        toast.success(`Added ${added.length} image${added.length === 1 ? "" : "s"}.`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const listRatio = folder === "packages" ? "1 : 1 (Square)" : "4 : 3 (Landscape)";
  const imgAspectClass = folder === "packages" ? "aspect-square" : "aspect-[4/3]";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-semibold text-ink">{label}</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-teal/10 px-2.5 py-0.5 text-[11px] font-medium text-teal-deep">
            <span className="font-semibold">Format:</span> {listRatio}
          </span>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          loading={busy}
          onClick={() => inputRef.current?.click()}
        >
          Add images
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files?.length) void addFiles(event.target.files);
        }}
      />

      {value.length === 0 ? (
        <p className="mt-2 rounded-xl border border-dashed border-black/15 px-4 py-6 text-center text-[13px] text-slate">
          No extra images yet. Recommended: {listRatio}.
        </p>
      ) : (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((image, index) => (
            <li
              key={image.publicId}
              className="overflow-hidden rounded-xl border border-black/10 bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewSrc(image, 300)}
                alt={image.alt || ""}
                className={`${imgAspectClass} w-full object-cover`}
              />
              <div className="space-y-1.5 p-2">
                <Input
                  value={image.alt}
                  placeholder="Alt text"
                  onChange={(event) => {
                    const next = [...value];
                    next[index] = { ...image, alt: event.target.value };
                    onChange(next);
                  }}
                  className="!px-2 !py-1 !text-[12px]"
                />
                <button
                  type="button"
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                  className="text-[12px] font-medium text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
