import type { NextRequest } from "next/server";

import { fail, handler, ok, zodFields } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/auth/session";
import { TAGS, bustHome } from "@/lib/cache";
import { db } from "@/lib/db/connect";
import { Category, Package } from "@/lib/db/models";
import { categoryUpdate } from "@/lib/validation/schemas";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

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

  category.set(parsed.data);
  await category.save(); // via save() so the slug hook runs

  bustHome(TAGS.categories, TAGS.category(category.slug));
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
      `${packageCount} package${packageCount === 1 ? "" : "s"} still use this category. Move or delete them first.`,
      undefined,
      { packageCount },
    );
  }

  const category = await Category.findByIdAndDelete(id).lean();
  if (!category) return fail("NOT_FOUND", "That category no longer exists.");

  bustHome(TAGS.categories, TAGS.category(category.slug));
  return ok({ deleted: true });
});
