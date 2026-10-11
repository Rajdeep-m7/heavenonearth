/**
 * Gives every destination, package and trending card its own photo of the
 * place it is about. The seed data had reused ~30 photos across ~100 places
 * (the Nepal peaks as the Darjeeling, Gangtok and Manali cards, the Goa beach
 * as "Digha & Udaipur", an anime illustration for Bhutan, ...).
 *
 * The picks live in scripts/destination-images.json. Every photo there was
 * chosen for its place and checked by eye: free-licence Unsplash photos only,
 * 3800px+ originals (most 5000px+), no signs, people close-ups or dark shots,
 * and none used twice.
 *
 *   npx tsx scripts/apply-destination-images.ts           # dry run — lists changes, writes nothing
 *   npx tsx scripts/apply-destination-images.ts --apply   # backs up touched documents, then writes
 *
 * The backup lands in scripts/.backups/ (git-ignored) so the change can be undone.
 * Matching is by name/title, so editing a document's image in the admin later is
 * unaffected — this only runs when you run it.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import mongoose from "mongoose";

type Picks = {
  categories: Record<string, string>;
  trending: Record<string, string>;
  /** [cover, ...gallery] */
  packages: Record<string, string[]>;
};

const picks: Picks = JSON.parse(readFileSync("scripts/destination-images.json", "utf8"));
const apply = process.argv.includes("--apply");

const norm = (s: unknown) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");
const index = (record: Record<string, unknown>) => new Map(Object.entries(record).map(([k, v]) => [norm(k), v]));

/** Stored the way the app already stores Unsplash photos: the URL is the id. */
function image(id: string, alt: string) {
  const url = `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=85&w=2400`;
  return { publicId: url, url, width: 2400, height: 1600, alt };
}

type Write = { collection: string; id: unknown; label: string; $set: Record<string, unknown> };
const writes: Write[] = [];
const backup: Record<string, unknown[]> = {};
const unmatched: string[] = [];
const used = new Set<string>();

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  const db = mongoose.connection.db!;

  const categories = index(picks.categories) as Map<string, string>;
  const trending = index(picks.trending) as Map<string, string>;
  const packages = index(picks.packages) as Map<string, string[]>;

  const queue = (collection: string, doc: Record<string, unknown>, label: string, $set: Record<string, unknown>) => {
    (backup[collection] ??= []).push(doc);
    writes.push({ collection, id: doc._id, label, $set });
  };

  for (const doc of await db.collection("categories").find({}).toArray()) {
    const key = norm(doc.name);
    const id = categories.get(key);
    if (!id) { unmatched.push(`categories: ${doc.name}`); continue; }
    used.add(`categories:${key}`);
    const hero = doc.heroImage as { alt?: string } | undefined;
    const thumb = doc.thumbnail as { alt?: string } | undefined;
    queue("categories", doc, String(doc.name), {
      heroImage: image(id, hero?.alt || `${doc.name} travel destination`),
      thumbnail: image(id, thumb?.alt || `${doc.name} destination thumbnail`),
    });
  }

  for (const doc of await db.collection("trendings").find({}).toArray()) {
    const key = norm(doc.name);
    const id = trending.get(key);
    // "Europe" is an image the owner uploaded to Cloudinary — left alone.
    if (!id) { unmatched.push(`trendings: ${doc.name} (kept)`); continue; }
    used.add(`trending:${key}`);
    const current = doc.image as { alt?: string } | undefined;
    queue("trendings", doc, String(doc.name), { image: image(id, current?.alt || `${doc.name} trending photo`) });
  }

  for (const doc of await db.collection("packages").find({}).toArray()) {
    const key = norm(doc.title);
    const ids = packages.get(key);
    if (!ids) { unmatched.push(`packages: ${doc.title}`); continue; }
    used.add(`packages:${key}`);
    const [cover, ...gallery] = ids;
    const current = doc.coverImage as { alt?: string } | undefined;
    queue("packages", doc, String(doc.title), {
      coverImage: image(cover, current?.alt || `${doc.title} cover photo`),
      images: gallery.map((id, i) => image(id, `${doc.title} — photo ${i + 2}`)),
    });
  }

  const by = (c: string) => writes.filter((w) => w.collection === c).length;
  console.log(`categories: ${by("categories")}   trending cards: ${by("trendings")}   packages: ${by("packages")}`);
  console.log(`package galleries: ${writes.filter((w) => w.collection === "packages").reduce((n, w) => n + (w.$set.images as unknown[]).length, 0)} photos`);
  if (unmatched.length) {
    console.log("\nNot in the picks file, left as they are:");
    for (const u of unmatched) console.log(`  ${u}`);
  }
  const missing = [
    ...Object.keys(picks.categories).filter((k) => !used.has(`categories:${norm(k)}`)).map((k) => `categories: ${k}`),
    ...Object.keys(picks.trending).filter((k) => !used.has(`trending:${norm(k)}`)).map((k) => `trending: ${k}`),
    ...Object.keys(picks.packages).filter((k) => !used.has(`packages:${norm(k)}`)).map((k) => `packages: ${k}`),
  ];
  if (missing.length) {
    console.log("\nIn the picks file but no matching document found:");
    for (const m of missing) console.log(`  ${m}`);
  }

  if (!apply) {
    console.log("\nDry run — nothing written. Re-run with --apply to make these changes.");
  } else if (writes.length) {
    mkdirSync("scripts/.backups", { recursive: true });
    const file = `scripts/.backups/destination-images-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    writeFileSync(file, JSON.stringify(backup, null, 2));
    console.log(`\nBacked up ${writes.length} original document(s) to ${file}`);
    for (const w of writes) await db.collection(w.collection).updateOne({ _id: w.id as never }, { $set: w.$set });
    console.log("Applied. The site picks the changes up within the hour, or immediately after any admin save.");
  }

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
