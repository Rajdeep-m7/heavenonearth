/**
 * Starter content for the home-page hero slider and the offer popup, so both
 * are visible straight away. Edit or replace everything from the admin panel
 * (Hero banner / Offer popup).
 *
 * Safe to re-run: it only inserts into an empty collection and never touches
 * slides or an offer that already exist.
 *
 *   npx tsx scripts/seed-hero-and-offer.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import mongoose from "mongoose";

const photo = (id: string, alt: string) => {
  const url = `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=85&w=2400`;
  return { publicId: url, url, width: 2400, height: 1350, alt };
};

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  const db = mongoose.connection.db!;

  /* ---------------- Hero slides ---------------- */
  const slides = db.collection("heroslides");
  if ((await slides.countDocuments()) > 0) {
    console.log("Hero slides already exist — left untouched.");
  } else {
    const slugs = new Map(
      (await db.collection("categories").find({ isActive: true }).project({ slug: 1 }).toArray()).map((c) => [c.slug as string, true]),
    );
    // Link to a destination page only if that destination really exists.
    const to = (slug: string) => (slugs.has(slug) ? `/destinations/${slug}` : "/destinations");
    const now = new Date();

    const rows = [
      {
        image: photo("1662551392187-768334a36d4e", "The snow-capped Kanchenjunga range rising above a dark pine forest near Darjeeling under a clear blue sky"),
        headline: "Find Your Own\nPiece of Heaven.",
        subheading: "The Himalayas",
        ctaLabel: "Explore Destinations",
        ctaHref: "/destinations",
      },
      {
        image: photo("1721070025492-26368db1706f", "Green tea slopes and a misty hill town in Darjeeling"),
        headline: "Tea Gardens &\nToy Trains.",
        subheading: "Darjeeling",
        ctaLabel: "Explore Darjeeling",
        ctaHref: to("darjeeling"),
      },
      {
        image: photo("1553351234-d0eb4feecb93", "Paro Taktsang, the Tiger's Nest monastery, clinging to a cliff in Bhutan"),
        headline: "The Last\nShangri-La.",
        subheading: "Bhutan",
        ctaLabel: "Explore Bhutan",
        ctaHref: to("bhutan"),
      },
      {
        image: photo("1595815771614-ade9d652a65d", "Shikara boats and houseboats on Dal Lake in Srinagar with snow-covered mountains behind"),
        headline: "Houseboats on\nDal Lake.",
        subheading: "Kashmir",
        ctaLabel: "Explore Kashmir",
        ctaHref: to("jammu-and-kashmir"),
      },
      {
        image: photo("1652787639646-1f4a8070de8c", "Snow-covered Himalayan peaks above a still lake in Sikkim"),
        headline: "Above the Clouds\nin Sikkim.",
        subheading: "Sikkim",
        ctaLabel: "Explore Sikkim",
        ctaHref: to("sikkim"),
      },
    ].map((slide, order) => ({ ...slide, order, isActive: true, createdAt: now, updatedAt: now }));

    await slides.insertMany(rows);
    console.log(`Added ${rows.length} hero slides.`);
  }

  /* ---------------- Offer popup ---------------- */
  const offers = db.collection("offerpopups");
  if ((await offers.countDocuments({ key: "main" })) > 0) {
    console.log("An offer popup already exists — left untouched.");
  } else {
    const now = new Date();
    await offers.insertOne({
      key: "main",
      isActive: true,
      badge: "Plan your trip",
      title: "Let our local experts plan your Himalayan journey",
      description:
        "Tell us where you'd like to go and we'll help you choose the right package, homestay and season — no pressure, just honest local advice.",
      couponCode: "",
      ctaLabel: "Explore Packages",
      ctaHref: "/packages",
      showOn: "home",
      frequency: "session",
      delaySeconds: 3,
      createdAt: now,
      updatedAt: now,
    });
    console.log("Added the offer popup (placeholder text — no discount or coupon). Edit it in Admin → Offer popup.");
  }

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
