import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

import { CloudinaryImageSchema, SeoSchema } from "@/lib/db/shared";
import { attachSlugHook } from "@/lib/db/slug";

const LocationSchema = new Schema(
  {
    address: { type: String, trim: true },
    locality: { type: String, trim: true },
    region: { type: String, trim: true },
    country: { type: String, default: "IN" },
    lat: { type: Number },
    lng: { type: Number },
  },
  { _id: false },
);

const StaySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    // Former slugs, so an old URL can 301 to the current one instead of 404ing.
    slugHistory: { type: [String], default: [], index: true },
    category: { type: Schema.Types.ObjectId, ref: "Category" },

    summary: { type: String, required: true, trim: true, maxlength: 300 },
    description: { type: String, trim: true },
    location: { type: LocationSchema, default: () => ({}) },

    propertyType: {
      type: String,
      enum: ["homestay", "resort", "cottage", "teaBungalow", "camp"],
      default: "homestay",
    },

    amenities: { type: [String], default: [] },
    houseRules: { type: [String], default: [] },
    cancellationPolicy: { type: String, trim: true },
    checkInTime: { type: String, default: "12:00" },
    checkOutTime: { type: String, default: "11:00" },

    host: {
      type: new Schema(
        {
          name: { type: String, trim: true },
          bio: { type: String, trim: true },
          avatar: { type: CloudinaryImageSchema },
          tags: { type: [String], default: [] },
        },
        { _id: false },
      ),
    },

    coverImage: { type: CloudinaryImageSchema, required: true },
    images: { type: [CloudinaryImageSchema], default: [] },

    // Denormalised from the cheapest active room. Recomputed on every room
    // write so listing pages never need a join or a per-card aggregation.
    priceFrom: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: "INR", uppercase: true },

    highlights: { type: [String], default: [] },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    seo: { type: SeoSchema, default: () => ({}) },
  },
  { timestamps: true },
);

StaySchema.index({ slug: 1 }, { unique: true });
StaySchema.index({ isActive: 1, order: 1 });
StaySchema.index({ category: 1, isActive: 1 });
StaySchema.index({ isFeatured: 1, isActive: 1 });

attachSlugHook(StaySchema, "name");

export type StayDoc = InferSchemaType<typeof StaySchema> & { _id: string };

export const Stay: Model<StayDoc> =
  (models.Stay as Model<StayDoc>) ?? model<StayDoc>("Stay", StaySchema);
