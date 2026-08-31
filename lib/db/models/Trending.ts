import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

import { CloudinaryImageSchema } from "@/lib/db/shared";
import { attachSlugHook } from "@/lib/db/slug";

const TrendingSchema = new Schema(
  {
    tab: { type: String, enum: ["international", "india"], required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    style: { type: String, enum: ["caps", "italic", "title"], default: "title" },
    image: { type: CloudinaryImageSchema, required: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

TrendingSchema.index({ tab: 1, order: 1 });
TrendingSchema.index({ slug: 1 }, { unique: true });

attachSlugHook(TrendingSchema, "name");

export type TrendingDoc = InferSchemaType<typeof TrendingSchema> & {
  _id: string;
};

export const Trending: Model<TrendingDoc> =
  (models.Trending as Model<TrendingDoc>) ??
  model<TrendingDoc>("Trending", TrendingSchema);