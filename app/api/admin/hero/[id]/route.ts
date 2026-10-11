import type { NextRequest } from "next/server";

import { fail, handler, ok, zodFields } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/auth/session";
import { TAGS, bustHome } from "@/lib/cache";
import { destroyImages } from "@/lib/cloudinary/server";
import { db } from "@/lib/db/connect";
import { HeroSlide } from "@/lib/db/models";
import { heroSlideUpdate } from "@/lib/validation/schemas";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = handler(async (request: NextRequest, { params }: Ctx) => {
  await requireAdmin(request);
  const { id } = await params;

  const parsed = heroSlideUpdate.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return fail("VALIDATION_FAILED", "Some fields need attention.", zodFields(parsed.error));
  }

  await db();
  const before = await HeroSlide.findById(id).select("image").lean();
  if (!before) return fail("NOT_FOUND", "That slide no longer exists.");

  const slide = await HeroSlide.findByIdAndUpdate(id, parsed.data, {
    new: true,
    runValidators: true,
  }).lean();
  if (!slide) return fail("NOT_FOUND", "That slide no longer exists.");

  // A replaced photo would otherwise sit in Cloudinary forever.
  if (parsed.data.image && parsed.data.image.publicId !== before.image.publicId) {
    await destroyImages([before.image]);
  }

  bustHome(TAGS.hero);
  return ok(slide);
});

export const DELETE = handler(async (request: NextRequest, { params }: Ctx) => {
  await requireAdmin(request);
  const { id } = await params;

  await db();
  const slide = await HeroSlide.findByIdAndDelete(id).lean();
  if (!slide) return fail("NOT_FOUND", "That slide no longer exists.");

  await destroyImages([slide.image]);

  bustHome(TAGS.hero);
  return ok({ deleted: true });
});
