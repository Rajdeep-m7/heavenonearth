import type { NextRequest } from "next/server";

import { fail, handler, ok, zodFields } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/auth/session";
import { TAGS, bustHome } from "@/lib/cache";
import { db } from "@/lib/db/connect";
import { Package } from "@/lib/db/models";
import { destroyAsset } from "@/lib/cloudinary/server";
import { packageUpdate } from "@/lib/validation/schemas";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = handler(async (request: NextRequest, { params }: Ctx) => {
  await requireAdmin(request);
  const { id } = await params;

  const parsed = packageUpdate.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return fail("VALIDATION_FAILED", "Some fields need attention.", zodFields(parsed.error));
  }

  await db();
  const pkg = await Package.findById(id);
  if (!pkg) return fail("NOT_FOUND", "That package no longer exists.");

  const previousSlug = pkg.slug;
  pkg.set(parsed.data);
  await pkg.save();

  bustHome(TAGS.packages, TAGS.package(pkg.slug), TAGS.package(previousSlug));
  return ok(pkg.toJSON());
});

export const DELETE = handler(async (request: NextRequest, { params }: Ctx) => {
  await requireAdmin(request);
  const { id } = await params;

  await db();
  const pkg = await Package.findByIdAndDelete(id).lean();
  if (!pkg) return fail("NOT_FOUND", "That package no longer exists.");

  // Clean up Cloudinary after the document is gone, so a failed delete never
  // leaves a live package pointing at a destroyed image.
  const assets = [pkg.coverImage, ...(pkg.images ?? [])]
    .filter(Boolean)
    .map((image) => image!.publicId);
  await Promise.allSettled(assets.map((publicId) => destroyAsset(publicId)));

  bustHome(TAGS.packages, TAGS.package(pkg.slug));
  return ok({ deleted: true });
});
