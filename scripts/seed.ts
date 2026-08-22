/**
 * Idempotent seed. Upserts by slug/email, so re-running never duplicates and
 * never resets an existing admin password.
 *
 *   npm run seed
 */
import { config as loadEnv } from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Next.js reads .env.local, plain Node does not — so load it explicitly, in
// the same precedence order Next uses. Without this the script would ignore
// the very file the docs tell you to fill in.
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { Admin } from "../lib/db/models/Admin";
import { Category } from "../lib/db/models/Category";
import { Package } from "../lib/db/models/Package";
import { Review } from "../lib/db/models/Review";
import { Room } from "../lib/db/models/Room";
import { Stay } from "../lib/db/models/Stay";

import { journeys } from "../lib/data/journeys";
import { homestays } from "../lib/data/homestays";
import { testimonials } from "../lib/data/testimonials";
import { regions } from "../lib/data/regions";

/** Local fixture paths become plain image records until real uploads land. */
const localImage = (src: string, alt: string) => ({
  publicId: src,
  url: src,
  width: 1200,
  height: 800,
  alt,
});

const MASTER_CATEGORIES = [
  {
    name: "Hill",
    slug: "hill",
    tagline: "Tea slopes, ridge towns and sunrise over Kanchenjunga.",
    description:
      "Himalayan hill stations — Darjeeling, Kalimpong, Kurseong and the high passes of Sikkim.",
    order: 0,
  },
  {
    name: "Sea",
    slug: "sea",
    tagline: "Long shorelines, fishing harbours and slow coastal mornings.",
    description:
      "Coastal escapes for travellers who would rather hear water than traffic.",
    order: 1,
  },
  {
    name: "Forest",
    slug: "forest",
    tagline: "Sal forests, river beds and the wildlife of the Dooars.",
    description:
      "Wildlife belts and forest retreats across the Dooars and the Bhutan foothills.",
    order: 2,
  },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Copy .env.example to .env.local.");

  await mongoose.connect(uri);
  console.log("connected");

  /* --- Admin ------------------------------------------------------------ */
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (email && password) {
    if (password.length < 12) {
      throw new Error("SEED_ADMIN_PASSWORD must be at least 12 characters.");
    }
    const existing = await Admin.findOne({ email: email.toLowerCase() }).lean();
    if (existing) {
      console.log(`admin: ${email} already exists (password untouched)`);
    } else {
      await Admin.create({
        email: email.toLowerCase(),
        passwordHash: await bcrypt.hash(password, 12),
        name: "Owner",
        role: "owner",
      });
      console.log(`admin: created ${email}`);
    }
  } else {
    console.log("admin: skipped (set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD)");
  }

  /* --- Categories ------------------------------------------------------- */
  const categoryIds = new Map<string, string>();

  for (const category of MASTER_CATEGORIES) {
    const region = regions.find((item) => item.slug === "darjeeling");
    const doc = await Category.findOneAndUpdate(
      { slug: category.slug },
      {
        $setOnInsert: {
          ...category,
          thumbnail:
            category.slug === "hill" && region
              ? localImage(region.image, region.alt)
              : undefined,
          isActive: true,
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
    categoryIds.set(category.slug, String(doc._id));
  }
  console.log(`categories: ${categoryIds.size}`);

  /* --- Categories from the design fixtures (Darjeeling / Sikkim / Dooars) */
  for (const [index, region] of regions.entries()) {
    const doc = await Category.findOneAndUpdate(
      { slug: region.slug },
      {
        $setOnInsert: {
          name: region.name,
          slug: region.slug,
          tagline: region.blurb,
          description: region.blurb,
          thumbnail: localImage(region.image, region.alt),
          order: 10 + index,
          isActive: true,
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
    categoryIds.set(region.slug, String(doc._id));
  }

  /* --- Packages --------------------------------------------------------- */
  const hillId = categoryIds.get("hill")!;

  for (const [index, journey] of journeys.entries()) {
    const categoryId =
      categoryIds.get(journey.slug.includes("sikkim") ? "sikkim" : "darjeeling") ??
      hillId;

    await Package.findOneAndUpdate(
      { slug: journey.slug },
      {
        $setOnInsert: {
          category: categoryId,
          title: journey.title,
          slug: journey.slug,
          summary: journey.quote,
          destination: journey.region,
          days: journey.days,
          nights: journey.nights,
          priceFrom: journey.priceFrom,
          currency: journey.currency,
          inclusions: journey.inclusions,
          coverImage: localImage(journey.image, journey.alt),
          badge: journey.badge === "New Journey" ? "newJourney" : "bestSeller",
          isFeatured: true,
          isActive: true,
          order: index,
        },
      },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }
  console.log(`packages: ${journeys.length}`);

  /* --- Stays + one starter room each ------------------------------------ */
  for (const [index, homestay] of homestays.entries()) {
    const [locality, region] = homestay.location.split(",").map((s) => s.trim());

    const stay = await Stay.findOneAndUpdate(
      { slug: homestay.slug },
      {
        $setOnInsert: {
          name: homestay.name,
          slug: homestay.slug,
          category: categoryIds.get("hill"),
          summary: homestay.blurb,
          location: { locality, region, country: "IN" },
          propertyType: "homestay",
          coverImage: localImage(homestay.image, homestay.alt),
          isFeatured: true,
          isActive: true,
          order: index,
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );

    const roomCount = await Room.countDocuments({ stay: stay._id });
    if (roomCount === 0) {
      await Room.create({
        stay: stay._id,
        name: "Valley View Double",
        description: "A double room with a private balcony over the valley.",
        maxAdults: 2,
        bedType: "1 Queen",
        pricePerNight: 6500,
        totalUnits: 3,
        amenities: ["Mountain view", "En-suite", "Breakfast included"],
      });
      await Stay.updateOne({ _id: stay._id }, { $set: { priceFrom: 6500 } });
    }
  }
  console.log(`stays: ${homestays.length}`);

  /* --- Reviews ---------------------------------------------------------- */
  for (const testimonial of testimonials) {
    await Review.findOneAndUpdate(
      { author: testimonial.author, quote: testimonial.quote },
      {
        $setOnInsert: {
          author: testimonial.author,
          rating: testimonial.rating,
          quote: testimonial.quote,
          trip: testimonial.trip,
          avatar: localImage(testimonial.avatar, testimonial.author),
          status: "approved",
          isFeatured: true,
          source: "admin",
          publishedAt: new Date(testimonial.datePublished),
        },
      },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }
  console.log(`reviews: ${testimonials.length}`);

  await mongoose.disconnect();
  console.log("done");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
