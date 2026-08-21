import type { NextRequest } from "next/server";

import { fail, handler, ok, zodFields } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/auth/session";
import { createUploadSignature } from "@/lib/cloudinary/server";
import { uploadSignature } from "@/lib/validation/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Hands the browser a short-lived signature so it can POST the file straight to
 * Cloudinary. The bytes never reach this function.
 */
export const POST = handler(async (request: NextRequest) => {
  await requireAdmin(request);

  const parsed = uploadSignature.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return fail("VALIDATION_FAILED", "Unknown upload folder.", zodFields(parsed.error));
  }

  return ok(createUploadSignature(parsed.data.folder));
});
