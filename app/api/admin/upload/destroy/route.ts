import type { NextRequest } from "next/server";
import { z } from "zod";

import { fail, handler, ok, zodFields } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/auth/session";
import { destroyAsset } from "@/lib/cloudinary/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const body = z.object({ publicId: z.string().min(1).max(300) });

export const POST = handler(async (request: NextRequest) => {
  await requireAdmin(request);

  const parsed = body.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return fail("VALIDATION_FAILED", "A publicId is required.", zodFields(parsed.error));
  }

  const result = await destroyAsset(parsed.data.publicId);
  return ok({ result: result.result });
});
