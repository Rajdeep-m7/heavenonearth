import type { Schema } from "mongoose";

/** "Darjeeling Tea & Mountain Escape" -> "darjeeling-tea-mountain-escape" */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

type SlugDoc = {
  slug?: string;
  _id: unknown;
  isModified(path: string): boolean;
  constructor: { exists(filter: Record<string, unknown>): Promise<unknown> };
};

/** Reads an arbitrary path off the document without widening `SlugDoc`. */
const field = (doc: SlugDoc, path: string): unknown =>
  (doc as unknown as Record<string, unknown>)[path];

/**
 * Derives a slug from `sourceField` when none was supplied, then appends
 * -2, -3 ... until it is free. The unique index is still the real guarantee;
 * this just avoids handing the admin a duplicate-key error we can resolve.
 */
export function attachSlugHook<T>(schema: Schema<T>, sourceField: string) {
  // Async middleware: Mongoose awaits the returned promise, so there is no
  // `next` callback to thread (and its typing differs across major versions).
  schema.pre("validate", async function () {
    const doc = this as unknown as SlugDoc;

    const source = field(doc, sourceField);
    if (!doc.slug && typeof source === "string") {
      doc.slug = slugify(source);
    }

    if (typeof doc.slug !== "string" || !doc.slug) return;
    if (!doc.isModified("slug") && !doc.isModified(sourceField)) return;

    doc.slug = slugify(doc.slug);

    const base = doc.slug;
    let candidate = base;
    let suffix = 2;

    // Bounded so a pathological collision set can never spin forever.
    while (suffix < 100) {
      const clash = await doc.constructor.exists({
        slug: candidate,
        _id: { $ne: doc._id },
      });
      if (!clash) break;
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }

    doc.slug = candidate;
  });
}
