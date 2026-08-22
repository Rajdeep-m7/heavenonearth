import type { NextRequest } from "next/server";

import { handler, ok } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db/connect";
import { Room, Stay } from "@/lib/db/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async (request: NextRequest) => {
  await requireAdmin(request);
  await db();

  const stays = await Stay.find({})
    .select("name slug summary coverImage location propertyType priceFrom isActive isFeatured order")
    .sort({ order: 1, createdAt: -1 })
    .limit(200)
    .lean();

  // Room counts in one grouped read rather than a query per stay.
  const counts = await Room.aggregate<{ _id: string; count: number }>([
    { $group: { _id: "$stay", count: { $sum: 1 } } },
  ]);
  const byStay = new Map(counts.map((row) => [String(row._id), row.count]));

  return ok(
    stays.map((stay) => ({ ...stay, roomCount: byStay.get(String(stay._id)) ?? 0 })),
  );
});
