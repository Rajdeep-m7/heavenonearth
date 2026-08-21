import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

import { CloudinaryImageSchema } from "@/lib/db/shared";

const GalleryItemSchema = new Schema(
  {
    image: { type: CloudinaryImageSchema, required: true },
    title: { type: String, trim: true },
    caption: { type: String, trim: true },
    tags: { type: [String], default: [], index: true },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    package: { type: Schema.Types.ObjectId, ref: "Package" },
    stay: { type: Schema.Types.ObjectId, ref: "Stay" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

GalleryItemSchema.index({ isActive: 1, order: 1 });
GalleryItemSchema.index({ category: 1, isActive: 1 });

export type GalleryItemDoc = InferSchemaType<typeof GalleryItemSchema> & {
  _id: string;
};

export const GalleryItem: Model<GalleryItemDoc> =
  (models.GalleryItem as Model<GalleryItemDoc>) ??
  model<GalleryItemDoc>("GalleryItem", GalleryItemSchema);
