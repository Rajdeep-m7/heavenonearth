import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const AdminSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    // select:false so a stray .find() can never surface the hash.
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ["owner", "editor"], default: "editor" },
    lastLoginAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type AdminDoc = InferSchemaType<typeof AdminSchema> & { _id: string };

export const Admin: Model<AdminDoc> =
  (models.Admin as Model<AdminDoc>) ?? model<AdminDoc>("Admin", AdminSchema);
