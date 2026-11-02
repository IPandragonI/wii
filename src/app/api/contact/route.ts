import { randomUUID } from "node:crypto";

import { MAX_FILL_MS, MIN_FILL_MS, validateContact, type ContactResponse } from "@/lib/contact";
import { readMailerConfig, sendContactEmail } from "@/lib/mailer";
import { createRateLimiter } from "@/lib/rate-limit";

const MAX_BODY_BYTES = 20_000;
const perVisitor = createRateLimiter(3, 10 * 60 * 1000);
const overall = createRateLimiter(40, 60 * 60 * 1000);

function reply(body: ContactResponse, status: number, headers?: HeadersInit) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

/** Only the site's own pages may post here. Requests without an Origin (non-browser clients) are refused too. */
function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === (request.headers.get("host") ?? new URL(request.url).host);
  } catch {
    return false;
  }
}

function visitorKey(request: Request): string {
  // On Vercel the platform sets x-forwarded-for, so its first entry is the client address.
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/**
 * Delivers a contact message. Order of checks: origin, rate limit, size and shape, spam traps,
 * validation, then the email provider. Success is reported only after the provider accepted it.
 */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return reply({ ok: false, code: "bad_request" }, 403);

  if (!overall.hit("all")) return reply({ ok: false, code: "rate_limited" }, 429, { "Retry-After": "3600" });
  if (!perVisitor.hit(visitorKey(request))) return reply({ ok: false, code: "rate_limited" }, 429, { "Retry-After": "600" });

  let payload: Record<string, unknown>;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return reply({ ok: false, code: "bad_request" }, 413);
    const parsed: unknown = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
    payload = parsed as Record<string, unknown>;
  } catch {
    return reply({ ok: false, code: "bad_request" }, 400);
  }

  // Trap 1: a field real visitors never see. Bots fill it; they get a normal-looking answer and nothing is sent.
  if (typeof payload.website === "string" && payload.website !== "") return reply({ ok: true }, 200);

  // Trap 2: a message written in under a few seconds.
  const elapsed = Date.now() - (typeof payload.startedAt === "number" ? payload.startedAt : NaN);
  if (!Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) return reply({ ok: false, code: "spam" }, 400);
  if (elapsed > MAX_FILL_MS) return reply({ ok: false, code: "expired" }, 400);

  const checked = validateContact(payload);
  if (!checked.ok) return reply({ ok: false, code: "invalid", errors: checked.errors }, 422);

  const config = readMailerConfig();
  if (!config) {
    console.error("[contact] RESEND_API_KEY is not set; the message was not delivered");
    return reply({ ok: false, code: "unavailable" }, 503);
  }

  const supplied = typeof payload.idempotencyKey === "string" && /^[\w-]{8,64}$/.test(payload.idempotencyKey);
  const result = await sendContactEmail(checked.data, {
    config,
    idempotencyKey: supplied ? (payload.idempotencyKey as string) : randomUUID(),
  });
  if (!result.ok) {
    console.error(`[contact] delivery failed${result.status ? ` (HTTP ${result.status})` : ""}`);
    return reply({ ok: false, code: "delivery_failed" }, 502);
  }
  return reply({ ok: true }, 200);
}
