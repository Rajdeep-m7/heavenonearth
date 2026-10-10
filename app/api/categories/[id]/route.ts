import type { NextRequest } from "next/server";

import { fail, handler, ok, zodFields } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/auth/session";
import { TAGS, bustHome } from "@/lib/cache";
import { db } from "@/lib/db/connect";
import { Category, Package } from "@/lib/db/models";
import { destroyImages } from "@/lib/cloudinary/server";
import { recordSlugChange } from "@/lib/db/slug";
import { categoryUpdate } from "@/lib/validation/schemas";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/** Admin single-record read — the edit form's loader. */
export const GET = handler(async (request: NextRequest, { params }: Ctx) => {
  await requireAdmin(request);
  const { id } = await params;

  await db();
  const doc = await Category.findById(id).lean();
  if (!doc) return fail("NOT_FOUND", "That category no longer exists.");

  return ok(doc);
});

export const PATCH = handler(async (request: NextRequest, { params }: Ctx) => {
  await requireAdmin(request);
  const { id } = await params;

  const parsed = categoryUpdate.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return fail("VALIDATION_FAILED", "Some fields need attention.", zodFields(parsed.error));
  }

  await db();
  const category = await Category.findById(id);
  if (!category) return fail("NOT_FOUND", "That category no longer exists.");

  const previousSlug = category.slug;
  category.set(parsed.data);
  await category.save(); // via save() so the slug hook runs
  await recordSlugChange(Category, category._id, previousSlug, category.slug);

  bustHome(
    TAGS.categories,
    TAGS.category(category.slug),
    TAGS.category(previousSlug),
  );
  return ok(category.toJSON());
});

export const DELETE = handler(async (request: NextRequest, { params }: Ctx) => {
  await requireAdmin(request);
  const { id } = await params;

  await db();

  // Refuse to orphan packages — the admin must reassign them first.
  const packageCount = await Package.countDocuments({ category: id });
  if (packageCount > 0) {
    return fail(
      "CATEGORY_IN_USE",
      packageCount === 1
        ? "1 package still uses this category. Move or delete it first."
        : `${packageCount} packages still use this category. Move or delete them first.`,
      undefined,
      { packageCount },
    );
  }

  const category = await Category.findByIdAndDelete(id).lean();
  if (!category) return fail("NOT_FOUND", "That category no longer exists.");

  await destroyImages([category.heroImage, category.thumbnail]);

  bustHome(TAGS.categories, TAGS.category(category.slug));
  return ok({ deleted: true });
});
