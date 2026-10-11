import type { NextRequest } from "next/server";

import { created, fail, handler, ok, zodFields } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/auth/session";
import { TAGS, bustHome } from "@/lib/cache";
import { db } from "@/lib/db/connect";
import { HeroSlide } from "@/lib/db/models";
import { heroSlideCreate } from "@/lib/validation/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SLIDES = 10;

export const GET = handler(async () => {
  await requireAdmin();
  await db();

  const slides = await HeroSlide.find({}).sort({ order: 1, createdAt: 1 }).lean();
  return ok(slides, { total: slides.length, max: MAX_SLIDES });
});

export const POST = handler(async (request: NextRequest) => {
  await requireAdmin(request);

  const parsed = heroSlideCreate.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return fail("VALIDATION_FAILED", "Some fields need attention.", zodFields(parsed.error));
  }

  await db();
  if ((await HeroSlide.countDocuments()) >= MAX_SLIDES) {
    return fail(
      "VALIDATION_FAILED",
      `A banner can hold at most ${MAX_SLIDES} slides. Delete one first.`,
    );
  }

  const inserted = await HeroSlide.create(parsed.data);

  bustHome(TAGS.hero);
  return created(inserted);
});
