import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

import { CloudinaryImageSchema } from "@/lib/db/shared";

/**
 * One slide of the home page hero banner. Slides play in `order`; the site
 * falls back to the built-in Darjeeling slide when none are active.
 */
const HeroSlideSchema = new Schema(
  {
    image: { type: CloudinaryImageSchema, required: true },
    headline: { type: String, required: true, trim: true },
    subheading: { type: String, default: "", trim: true },
    ctaLabel: { type: String, default: "", trim: true },
    ctaHref: { type: String, default: "", trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

HeroSlideSchema.index({ isActive: 1, order: 1 });

export type HeroSlideDoc = InferSchemaType<typeof HeroSlideSchema> & {
  _id: string;
};

export const HeroSlide: Model<HeroSlideDoc> =
  (models.HeroSlide as Model<HeroSlideDoc>) ??
  model<HeroSlideDoc>("HeroSlide", HeroSlideSchema);
