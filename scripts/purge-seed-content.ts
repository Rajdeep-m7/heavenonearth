/**
 * Finds (and optionally removes) the placeholder content that `npm run seed`
 * put in the database, so it cannot reach production or structured data.
 *
 *   npx tsx scripts/purge-seed-content.ts            # report only
 *   npx tsx scripts/purge-seed-content.ts --apply    # delete placeholder reviews
 *
 * Only the invented testimonials are deleted automatically — they are
 * fabricated social proof. Seeded packages and stays are reported but left
 * alone, because you may have edited them into real listings; delete or
 * rewrite those in /admin.
 */
import { config as loadEnv } from "dotenv";
import mongoose from "mongoose";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { Package } from "../lib/db/models/Package";
import { Review } from "../lib/db/models/Review";
import { Stay } from "../lib/db/models/Stay";

import { homestays } from "../lib/data/homestays";
import { journeys } from "../lib/data/journeys";
import { testimonials } from "../lib/data/testimonials";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set.");
  const apply = process.argv.includes("--apply");

  await mongoose.connect(uri);

  const reviewFilter = {
    $or: testimonials.map((t) => ({ author: t.author, quote: t.quote })),
  };
  const reviews = await Review.find(reviewFilter).select("author trip status").lean();
  console.log(`Placeholder reviews: ${reviews.length}`);
  for (const review of reviews) {
    console.log(`  - ${review.author} (${review.trip ?? "no trip"}) [${review.status}]`);
  }

  const packages = await Package.find({ slug: { $in: journeys.map((j) => j.slug) } })
    .select("slug title")
    .lean();
  console.log(`Seeded packages still present: ${packages.length}`);
  for (const pkg of packages) console.log(`  - ${pkg.slug} — ${pkg.title}`);

  const stays = await Stay.find({ slug: { $in: homestays.map((h) => h.slug) } })
    .select("slug name")
    .lean();
  console.log(`Seeded stays still present: ${stays.length}`);
  for (const stay of stays) console.log(`  - ${stay.slug} — ${stay.name}`);

  if (apply && reviews.length > 0) {
    const result = await Review.deleteMany(reviewFilter);
    console.log(`\nDeleted ${result.deletedCount} placeholder review(s).`);
  } else if (reviews.length > 0) {
    console.log("\nDry run — re-run with --apply to delete the placeholder reviews.");
  }

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
