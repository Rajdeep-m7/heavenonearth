import { Schema } from "mongoose";

/**
 * One image, stored by Cloudinary publicId. The publicId is the source of
 * truth — every rendered size is derived from it by the next/image loader, so
 * we never store a width-specific URL.
 */
export const CloudinaryImageSchema = new Schema(
  {
    publicId: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    alt: { type: String, default: "", trim: true },
    blurDataURL: { type: String },
  },
  { _id: false },
);

export type CloudinaryImage = {
  publicId: string;
  url: string;
  width: number;
  height: number;
  alt: string;
  blurDataURL?: string;
};

export const SeoSchema = new Schema(
  {
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    keywords: { type: [String], default: [] },
  },
  { _id: false },
);

export type Seo = {
  // Mongoose's lean() types report unset optional strings as `null`, not
  // just `undefined` — accept both rather than normalising every call site.
  title?: string | null;
  description?: string | null;
  keywords?: string[];
};

/** Strips Mongo internals from anything sent to a client component. */
export const leanJson = <T>(doc: T): T =>
  JSON.parse(JSON.stringify(doc)) as T;

/** The shape view-layer code actually needs — no `blurDataURL`, no `null`s. */
export type Image = Omit<CloudinaryImage, "blurDataURL">;

/**
 * Normalises a lean Mongoose image subdocument into a plain `Image`.
 * Mongoose's lean types report optional fields as `string | null`, which is a
 * real mismatch against `blurDataURL?: string` — dropping the field sidesteps
 * it, and no page currently renders a blur placeholder anyway.
 */
export function pickImage(
  image: { publicId: string; url: string; width: number; height: number; alt?: string | null } | null | undefined,
): Image | undefined {
  if (!image) return undefined;
  return {
    publicId: image.publicId,
    url: image.url,
    width: image.width,
    height: image.height,
    alt: image.alt ?? "",
  };
}
