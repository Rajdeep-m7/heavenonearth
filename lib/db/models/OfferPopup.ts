import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

import { CloudinaryImageSchema } from "@/lib/db/shared";

/**
 * The site-wide offer popup. There is exactly one — `key` is fixed and unique,
 * so the admin edits a single document rather than managing a list.
 */
const OfferPopupSchema = new Schema(
  {
    key: { type: String, default: "main", unique: true, immutable: true },
    isActive: { type: Boolean, default: false },
    badge: { type: String, default: "", trim: true },
    title: { type: String, default: "", trim: true },
    description: { type: String, default: "", trim: true },
    image: { type: CloudinaryImageSchema },
    couponCode: { type: String, default: "", trim: true },
    ctaLabel: { type: String, default: "", trim: true },
    ctaHref: { type: String, default: "", trim: true },
    /** "home" = only the home page, "all" = every public page. */
    showOn: { type: String, enum: ["home", "all"], default: "home" },
    /** How often one visitor sees it: every page load, once a session, or once a day. */
    frequency: { type: String, enum: ["visit", "session", "day"], default: "session" },
    delaySeconds: { type: Number, min: 0, max: 30, default: 2 },
    startsAt: { type: Date },
    endsAt: { type: Date },
  },
  { timestamps: true },
);

export type OfferPopupDoc = InferSchemaType<typeof OfferPopupSchema> & {
  _id: string;
};

export const OfferPopup: Model<OfferPopupDoc> =
  (models.OfferPopup as Model<OfferPopupDoc>) ??
  model<OfferPopupDoc>("OfferPopup", OfferPopupSchema);
