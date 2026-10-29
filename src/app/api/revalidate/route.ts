import { timingSafeEqual } from "node:crypto";

import { revalidateTag } from "next/cache";

import { PORTFOLIO_CACHE_TAG } from "@/config/site";

/**
 * Maintenance endpoint: marks the cached portfolio stale so the next visit refreshes it.
 * Disabled unless REVALIDATE_SECRET is set; requires `Authorization: Bearer <secret>`.
 * Stale-while-revalidate semantics mean it can't be used to hammer the providers.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || secret.length < 16) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const header = request.headers.get("authorization") ?? "";
  const provided = Buffer.from(header.replace(/^Bearer\s+/i, ""));
  const expected = Buffer.from(secret);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidateTag(PORTFOLIO_CACHE_TAG, "max");
  return Response.json({ revalidated: true });
}
