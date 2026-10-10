import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

import { CloudinaryImageSchema, SeoSchema } from "@/lib/db/shared";
import { attachSlugHook } from "@/lib/db/slug";

const ItineraryDaySchema = new Schema(
  {
    day: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    detail: { type: String, trim: true },
  },
  { _id: false },
);

const PackageSchema = new Schema(
  {
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    // Former slugs, so an old URL can 301 to the current one instead of 404ing.
    slugHistory: { type: [String], default: [], index: true },
    summary: { type: String, required: true, trim: true, maxlength: 300 },
    description: { type: String, trim: true },
    destination: { type: String, trim: true },

    days: { type: Number, required: true, min: 1 },
    nights: { type: Number, required: true, min: 0 },

    priceFrom: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR", uppercase: true },

    inclusions: { type: [String], default: [] },
    exclusions: { type: [String], default: [] },
    itinerary: { type: [ItineraryDaySchema], default: [] },

    coverImage: { type: CloudinaryImageSchema, required: true },
    images: { type: [CloudinaryImageSchema], default: [] },

    badge: {
      type: String,
      enum: ["bestSeller", "newJourney", "none"],
      default: "none",
    },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    seo: { type: SeoSchema, default: () => ({}) },
  },
  { timestamps: true },
);

PackageSchema.index({ slug: 1 }, { unique: true });
PackageSchema.index({ category: 1, isActive: 1, order: 1 });
PackageSchema.index({ isFeatured: 1, isActive: 1 });
PackageSchema.index({ title: "text", summary: "text", destination: "text" });

attachSlugHook(PackageSchema, "title");

/** "4 Days / 3 Nights" — derived so a wording change needs no migration. */
PackageSchema.virtual("duration").get(function () {
  return `${this.days} Days / ${this.nights} Nights`;
});

PackageSchema.set("toJSON", { virtuals: true });
PackageSchema.set("toObject", { virtuals: true });

export type PackageDoc = InferSchemaType<typeof PackageSchema> & {
  _id: string;
};

export const Package: Model<PackageDoc> =
  (models.Package as Model<PackageDoc>) ??
  model<PackageDoc>("Package", PackageSchema);
