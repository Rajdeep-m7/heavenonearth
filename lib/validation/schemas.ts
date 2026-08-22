import { z } from "zod";

/**
 * One source of truth for shape. The API routes parse with these, and the
 * admin forms render errors from the same messages — so a rule can never drift
 * between client and server.
 */

export const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Not a valid id");

export const cloudinaryImage = z.object({
  publicId: z.string().min(1),
  url: z.string().url(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string().max(180).default(""),
  blurDataURL: z.string().optional(),
});

export const seo = z
  .object({
    title: z.string().max(70).optional(),
    description: z.string().max(180).optional(),
    keywords: z.array(z.string()).max(20).optional(),
  })
  .optional();

const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and hyphens only")
  .optional();

/* ------------------------------------------------------------------ */
/* Category — the master package                                       */
/* ------------------------------------------------------------------ */

export const categoryCreate = z.object({
  name: z.string().min(2, "At least 2 characters").max(60),
  slug,
  tagline: z.string().max(140).optional(),
  description: z.string().max(4000).optional(),
  heroImage: cloudinaryImage.optional(),
  thumbnail: cloudinaryImage.optional(),
  icon: z.string().max(40).optional(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  seo,
});

export const categoryUpdate = categoryCreate.partial();

/* ------------------------------------------------------------------ */
/* Package                                                             */
/* ------------------------------------------------------------------ */

const packageBase = z.object({
    category: objectId,
    title: z.string().min(3).max(120),
    slug,
    summary: z.string().min(10, "At least 10 characters").max(300),
    description: z.string().max(20000).optional(),
    destination: z.string().max(120).optional(),
    days: z.number().int().min(1, "At least 1 day"),
    nights: z.number().int().min(0),
    priceFrom: z.number().min(0, "Must be zero or more"),
    currency: z.string().length(3).default("INR"),
    inclusions: z.array(z.string().max(60)).max(20).default([]),
    exclusions: z.array(z.string().max(60)).max(20).default([]),
    itinerary: z
      .array(
        z.object({
          day: z.number().int().min(1),
          title: z.string().min(2).max(120),
          detail: z.string().max(2000).optional(),
        }),
      )
      .max(30)
      .default([]),
    coverImage: cloudinaryImage,
    images: z.array(cloudinaryImage).max(20).default([]),
    badge: z.enum(["bestSeller", "newJourney", "none"]).default("none"),
    isFeatured: z.boolean().default(false),
    isActive: z.boolean().default(true),
    order: z.number().int().default(0),
  seo,
});

export const packageCreate = packageBase.refine(
  (value) => value.nights <= value.days,
  { message: "Nights cannot exceed days", path: ["nights"] },
);

export const packageUpdate = packageBase.partial();

/* ------------------------------------------------------------------ */
/* Stay + Room                                                         */
/* ------------------------------------------------------------------ */

export const stayCreate = z.object({
  name: z.string().min(2).max(120),
  slug,
  category: objectId.optional(),
  summary: z.string().min(10).max(300),
  description: z.string().max(20000).optional(),
  location: z
    .object({
      address: z.string().max(200).optional(),
      locality: z.string().max(80).optional(),
      region: z.string().max(80).optional(),
      country: z.string().max(2).default("IN"),
      lat: z.number().min(-90).max(90).optional(),
      lng: z.number().min(-180).max(180).optional(),
    })
    .optional(),
  propertyType: z
    .enum(["homestay", "resort", "cottage", "teaBungalow", "camp"])
    .default("homestay"),
  amenities: z.array(z.string().max(60)).max(30).default([]),
  houseRules: z.array(z.string().max(140)).max(20).default([]),
  cancellationPolicy: z.string().max(2000).optional(),
  checkInTime: z.string().max(10).default("12:00"),
  checkOutTime: z.string().max(10).default("11:00"),
  host: z
    .object({
      name: z.string().max(80).optional(),
      bio: z.string().max(2000).optional(),
      avatar: cloudinaryImage.optional(),
      tags: z.array(z.string().max(40)).max(8).default([]),
    })
    .optional(),
  coverImage: cloudinaryImage,
  images: z.array(cloudinaryImage).max(30).default([]),
  highlights: z.array(z.string().max(60)).max(10).default([]),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  order: z.number().int().default(0),
  seo,
});

export const stayUpdate = stayCreate.partial();

export const roomCreate = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(4000).optional(),
  maxAdults: z.number().int().min(1).default(2),
  maxChildren: z.number().int().min(0).default(0),
  bedType: z.string().max(60).optional(),
  sizeSqft: z.number().int().positive().optional(),
  pricePerNight: z.number().min(0),
  extraGuestCharge: z.number().min(0).default(0),
  totalUnits: z.number().int().min(1).default(1),
  amenities: z.array(z.string().max(60)).max(20).default([]),
  images: z.array(cloudinaryImage).max(15).default([]),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const roomUpdate = roomCreate.partial();

/* ------------------------------------------------------------------ */
/* Review                                                              */
/* ------------------------------------------------------------------ */

export const reviewPublicCreate = z.object({
  author: z.string().min(2, "Please tell us your name").max(60),
  email: z.string().email("Enter a valid email").optional(),
  rating: z.number().int().min(1).max(5),
  quote: z.string().min(10, "A little more detail, please").max(600),
  trip: z.string().max(120).optional(),
  location: z.string().max(120).optional(),
  package: objectId.optional(),
  stay: objectId.optional(),
  // Honeypot: real users never see this field, bots fill everything.
  // Deliberately permissive — the handler discards a filled one and still
  // answers 201. Rejecting it here would tell the bot which field to omit.
  website: z.string().max(200).optional(),
});

export const reviewAdminCreate = reviewPublicCreate
  .omit({ website: true })
  .extend({
    avatar: cloudinaryImage.optional(),
    isFeatured: z.boolean().default(false),
  });

export const reviewModerate = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  isFeatured: z.boolean().optional(),
});

/* ------------------------------------------------------------------ */
/* Gallery                                                             */
/* ------------------------------------------------------------------ */

export const galleryItem = z.object({
  image: cloudinaryImage,
  title: z.string().max(120).optional(),
  caption: z.string().max(300).optional(),
  tags: z.array(z.string().max(40)).max(12).default([]),
  category: objectId.optional(),
  package: objectId.optional(),
  stay: objectId.optional(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

/** Accepts one item or a whole batch, so a multi-file upload is one request. */
export const galleryCreate = z.union([
  galleryItem,
  z.object({ items: z.array(galleryItem).min(1).max(50) }),
]);

export const galleryUpdate = galleryItem.partial();

export const galleryReorder = z.object({
  order: z.array(objectId).min(1).max(200),
});

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export const adminLogin = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export const uploadSignature = z.object({
  folder: z.enum(["categories", "packages", "stays", "rooms", "gallery", "reviews"]),
});

/** 12+ characters everywhere a password is set — matches scripts/seed.ts and scripts/add-admin.ts. */
const adminPassword = z.string().min(12, "At least 12 characters");

export const adminUserCreate = z.object({
  email: z.string().email("Enter a valid email"),
  password: adminPassword,
  name: z.string().min(2, "At least 2 characters").max(80),
  role: z.enum(["owner", "editor"]).default("editor"),
});

export const adminUserUpdate = z.object({
  name: z.string().min(2).max(80).optional(),
  role: z.enum(["owner", "editor"]).optional(),
  isActive: z.boolean().optional(),
  // Optional: omitting it leaves the existing password untouched.
  password: adminPassword.optional(),
});

/* ------------------------------------------------------------------ */
/* Shared list query                                                   */
/* ------------------------------------------------------------------ */

export const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  // Clamped, not just validated — an unbounded limit is a free-tier hazard.
  limit: z.coerce.number().int().min(1).max(50).default(12),
  q: z.string().max(120).optional(),
  sort: z.string().max(40).optional(),
});

export type ListQuery = z.infer<typeof listQuery>;
