import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

import { CloudinaryImageSchema } from "@/lib/db/shared";

const ReviewSchema = new Schema(
  {
    author: { type: String, required: true, trim: true, maxlength: 60 },
    // Never returned by the public API.
    email: { type: String, trim: true, lowercase: true, select: false },

    rating: { type: Number, required: true, min: 1, max: 5 },
    quote: { type: String, required: true, trim: true, maxlength: 600 },
    trip: { type: String, trim: true },
    location: { type: String, trim: true },
    avatar: { type: CloudinaryImageSchema },

    package: { type: Schema.Types.ObjectId, ref: "Package" },
    stay: { type: Schema.Types.ObjectId, ref: "Stay" },
    category: { type: Schema.Types.ObjectId, ref: "Category" },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    isFeatured: { type: Boolean, default: false },
    publishedAt: { type: Date },
    source: { type: String, enum: ["web", "admin"], default: "web" },
  },
  { timestamps: true },
);

ReviewSchema.index({ status: 1, publishedAt: -1 });
ReviewSchema.index({ package: 1, status: 1 });
ReviewSchema.index({ stay: 1, status: 1 });
ReviewSchema.index({ isFeatured: 1, status: 1 });

export type ReviewDoc = InferSchemaType<typeof ReviewSchema> & { _id: string };

export const Review: Model<ReviewDoc> =
  (models.Review as Model<ReviewDoc>) ??
  model<ReviewDoc>("Review", ReviewSchema);

/** Aggregate rating for JSON-LD. One round trip, approved reviews only. */
export async function aggregateRating(filter: Record<string, unknown> = {}) {
  const [row] = await Review.aggregate<{ value: number; count: number }>([
    { $match: { status: "approved", ...filter } },
    {
      $group: {
        _id: null,
        value: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
    { $project: { _id: 0, value: { $round: ["$value", 2] }, count: 1 } },
  ]);

  return row ?? null;
}
