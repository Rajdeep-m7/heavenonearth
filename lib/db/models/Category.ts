import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

import { CloudinaryImageSchema, SeoSchema } from "@/lib/db/shared";
import { attachSlugHook } from "@/lib/db/slug";

/**
 * The "master package" — Hill, Sea, Forest. Admin-managed rather than an enum,
 * so a new grouping never needs a redeploy.
 */
const CategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    // Former slugs, so an old URL can 301 to the current one instead of 404ing.
    slugHistory: { type: [String], default: [], index: true },
    tagline: { type: String, trim: true },
    description: { type: String, trim: true },
    heroImage: { type: CloudinaryImageSchema },
    thumbnail: { type: CloudinaryImageSchema },
    icon: { type: String, trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    seo: { type: SeoSchema, default: () => ({}) },
  },
  { timestamps: true },
);

CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ isActive: 1, order: 1 });

attachSlugHook(CategorySchema, "name");

export type CategoryDoc = InferSchemaType<typeof CategorySchema> & {
  _id: string;
};

export const Category: Model<CategoryDoc> =
  (models.Category as Model<CategoryDoc>) ??
  model<CategoryDoc>("Category", CategorySchema);
