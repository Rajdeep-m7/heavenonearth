/**
 * Moves every image that is still an Unsplash link — destination, package,
 * trending, hero slide and offer popup photos — into your Cloudinary account,
 * so the site no longer depends on hot-linking Unsplash.
 *
 * Cloudinary fetches each photo itself, so nothing is downloaded through this
 * machine. Masters are stored at 2400px wide (1200px for category thumbnails)
 * — plenty for any screen, and small enough to stay well inside the free plan.
 *
 *   npx tsx scripts/migrate-images-to-cloudinary.ts           # dry run: plan + credential check, uploads nothing
 *   npx tsx scripts/migrate-images-to-cloudinary.ts --apply   # uploads, backs up documents, then updates them
 *
 * Safe to re-run: uploads use a fixed public id and never overwrite, so photos
 * already in Cloudinary are reused, and a document whose upload failed simply
 * keeps its old link until the next run.
 *
 * Each slot gets its OWN Cloudinary asset (folder + photo id; "-thumb" for
 * category thumbnails). The admin deletes a document's images when the
 * document is deleted or its image replaced, so assets are never shared
 * between documents.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { mkdirSync, writeFileSync } from "node:fs";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

const apply = process.argv.includes("--apply");
const ROOT = "heavenonearth";
const PHOTO_ID = /photo-[0-9a-f]+-[0-9a-f]+/;

/** collection -> [Cloudinary folder, image fields]. A field ending in [] is an array. */
const TARGETS: Record<string, { folder: string; fields: string[] }> = {
  categories: { folder: "categories", fields: ["heroImage", "thumbnail"] },
  packages: { folder: "packages", fields: ["coverImage", "images[]"] },
  trendings: { folder: "trending", fields: ["image"] },
  heroslides: { folder: "hero", fields: ["image"] },
  offerpopups: { folder: "offers", fields: ["image"] },
};

type Img = { publicId?: string; url?: string; width?: number; height?: number; alt?: string };
type Job = { publicId: string; source: string };
type Uploaded = { publicId: string; url: string; width: number; height: number };

const isUnsplash = (img: unknown): img is Img =>
  !!img && typeof img === "object" && /images\.unsplash\.com/.test(`${(img as Img).publicId} ${(img as Img).url}`);

function jobFor(collection: string, field: string, img: Img): Job {
  const photo = `${img.publicId ?? img.url}`.match(PHOTO_ID)![0];
  const thumb = field === "thumbnail";
  const width = thumb ? 1200 : 2400;
  return {
    publicId: `${ROOT}/${TARGETS[collection].folder}/${photo}${thumb ? "-thumb" : ""}`,
    // fm=jpg: a plain JPEG master, not whatever format Unsplash would negotiate.
    source: `https://images.unsplash.com/${photo}?fm=jpg&fit=crop&q=90&w=${width}`,
  };
}

async function upload(job: Job): Promise<Uploaded> {
  const r = await cloudinary.uploader.upload(job.source, {
    public_id: job.publicId,
    overwrite: false, // an existing asset comes back as-is, so re-runs are free
    resource_type: "image",
  });
  return { publicId: r.public_id, url: r.secure_url, width: r.width, height: r.height };
}

async function pool<T>(items: T[], size: number, fn: (item: T, i: number) => Promise<void>) {
  let next = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (next < items.length) {
        const i = next++;
        await fn(items[i], i);
      }
    }),
  );
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  await cloudinary.api.ping(); // fails loudly on bad credentials, before anything else
  console.log(`Cloudinary credentials OK (cloud: ${process.env.CLOUDINARY_CLOUD_NAME}).`);

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  const db = mongoose.connection.db!;

  // 1. Plan: every slot that still points at Unsplash.
  const jobs = new Map<string, Job>();
  const docs: { collection: string; doc: Record<string, unknown> }[] = [];
  for (const [collection, { fields }] of Object.entries(TARGETS)) {
    for (const doc of await db.collection(collection).find({}).toArray()) {
      let touched = false;
      for (const f of fields) {
        const name = f.replace("[]", "");
        const value = doc[name];
        const list = f.endsWith("[]") ? (Array.isArray(value) ? value : []) : [value];
        for (const img of list) {
          if (isUnsplash(img)) {
            const job = jobFor(collection, name, img);
            jobs.set(job.publicId, job);
            touched = true;
          }
        }
      }
      if (touched) docs.push({ collection, doc });
    }
  }

  const perFolder: Record<string, number> = {};
  for (const j of jobs.values()) {
    const folder = j.publicId.split("/")[1];
    perFolder[folder] = (perFolder[folder] ?? 0) + 1;
  }
  console.log(`\n${jobs.size} photos to move into Cloudinary, across ${docs.length} documents:`);
  for (const [folder, n] of Object.entries(perFolder)) console.log(`  ${folder.padEnd(12)} ${n}`);

  if (!apply) {
    console.log("\nDry run — nothing uploaded or changed. Re-run with --apply to migrate.");
    await mongoose.disconnect();
    return;
  }

  // 2. Upload (Cloudinary pulls each photo from Unsplash itself).
  const done = new Map<string, Uploaded>();
  const failed: string[] = [];
  const list = [...jobs.values()];
  await pool(list, 4, async (job, i) => {
    try {
      done.set(job.publicId, await upload(job));
    } catch (error) {
      failed.push(job.publicId);
      console.warn(`  FAILED ${job.publicId}: ${(error as Error).message}`);
    }
    if ((i + 1) % 20 === 0 || i + 1 === list.length) console.log(`  uploaded ${done.size}/${list.length}`);
  });

  // 3. Back up, then rewrite only the slots whose upload succeeded.
  mkdirSync("scripts/.backups", { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backup: Record<string, unknown[]> = {};
  for (const { collection, doc } of docs) (backup[collection] ??= []).push(doc);
  const file = `scripts/.backups/before-cloudinary-${stamp}.json`;
  writeFileSync(file, JSON.stringify(backup, null, 2));
  console.log(`\nBacked up ${docs.length} document(s) to ${file}`);

  const swap = (collection: string, name: string, img: unknown) => {
    if (!isUnsplash(img)) return img;
    const up = done.get(jobFor(collection, name, img).publicId);
    return up ? { publicId: up.publicId, url: up.url, width: up.width, height: up.height, alt: img.alt ?? "" } : img;
  };

  let updated = 0;
  for (const { collection, doc } of docs) {
    const $set: Record<string, unknown> = {};
    for (const f of TARGETS[collection].fields) {
      const name = f.replace("[]", "");
      $set[name] = f.endsWith("[]")
        ? ((doc[name] as unknown[]) ?? []).map((img) => swap(collection, name, img))
        : swap(collection, name, doc[name]);
    }
    await db.collection(collection).updateOne({ _id: doc._id as never }, { $set });
    updated++;
  }

  console.log(`\nUpdated ${updated} document(s). ${done.size} photo(s) now in Cloudinary${failed.length ? `, ${failed.length} failed (re-run to retry)` : ""}.`);
  console.log("The site picks it up within the hour, or immediately after any admin save.");
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
