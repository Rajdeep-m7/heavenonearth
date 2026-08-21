import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

import { CloudinaryImageSchema } from "@/lib/db/shared";

const RoomSchema = new Schema(
  {
    stay: {
      type: Schema.Types.ObjectId,
      ref: "Stay",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    maxAdults: { type: Number, required: true, min: 1, default: 2 },
    maxChildren: { type: Number, default: 0, min: 0 },
    bedType: { type: String, trim: true },
    sizeSqft: { type: Number },

    pricePerNight: { type: Number, required: true, min: 0 },
    extraGuestCharge: { type: Number, default: 0, min: 0 },
    totalUnits: { type: Number, required: true, min: 1, default: 1 },

    amenities: { type: [String], default: [] },
    images: { type: [CloudinaryImageSchema], default: [] },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

RoomSchema.index({ stay: 1, isActive: 1, order: 1 });

export type RoomDoc = InferSchemaType<typeof RoomSchema> & { _id: string };

export const Room: Model<RoomDoc> =
  (models.Room as Model<RoomDoc>) ?? model<RoomDoc>("Room", RoomSchema);

/**
 * Keeps `Stay.priceFrom` in step with its cheapest active room. Called by the
 * room routes after any create/update/delete — the denormalised field is only
 * safe because this is the single place it is written.
 */
export async function syncStayPriceFrom(stayId: string) {
  const { Stay } = await import("@/lib/db/models/Stay");

  const [cheapest] = await Room.find({ stay: stayId, isActive: true })
    .select("pricePerNight")
    .sort({ pricePerNight: 1 })
    .limit(1)
    .lean();

  await Stay.updateOne(
    { _id: stayId },
    { $set: { priceFrom: cheapest?.pricePerNight ?? 0 } },
  );
}
