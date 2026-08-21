import { fail, handler, ok } from "@/lib/api/respond";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/connect";
import { Admin } from "@/lib/db/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The admin shell calls this on mount. Re-reading `isActive` here is what makes
 * a disabled account effective within one page load, even though the JWT it
 * holds is still cryptographically valid.
 */
export const GET = handler(async () => {
  const session = await getSession();
  if (!session) return fail("UNAUTHORIZED", "Not signed in.");

  await db();
  const admin = await Admin.findOne({ _id: session.sub, isActive: true })
    .select("name email role lastLoginAt")
    .lean();

  if (!admin) return fail("UNAUTHORIZED", "This account is no longer active.");

  return ok({
    id: String(admin._id),
    name: admin.name,
    email: admin.email,
    role: admin.role,
    lastLoginAt: admin.lastLoginAt ?? null,
  });
});
