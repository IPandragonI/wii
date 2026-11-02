import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/contact/route";
import { validateContact } from "@/lib/contact";
import { createRateLimiter } from "@/lib/rate-limit";

const valid = { name: "Ada", email: "ada@example.com", subject: "Hello", message: "I'd like to talk about a project." };

describe("validateContact", () => {
  it("accepts and trims a complete message", () => {
    const result = validateContact({ ...valid, name: "  Ada  " });
    expect(result).toEqual({ ok: true, data: valid });
  });

  it("reports required fields", () => {
    const result = validateContact({});
    expect(result).toEqual({
      ok: false,
      errors: { name: "required", email: "required", subject: "required", message: "required" },
    });
  });

  it.each(["not-an-email", "a@b", "a b@example.com", "a@example.com, b@example.com", "<a@example.com>"])(
    "rejects the email %s",
    (email) => {
      expect(validateContact({ ...valid, email })).toMatchObject({ ok: false, errors: { email: "invalid" } });
    },
  );

  it("rejects line breaks in single-line fields (header injection)", () => {
    expect(validateContact({ ...valid, subject: "Hi\r\nBcc: x@example.com" })).toMatchObject({
      ok: false,
      errors: { subject: "invalid" },
    });
  });

  it("enforces message length bounds", () => {
    expect(validateContact({ ...valid, message: "short" })).toMatchObject({ errors: { message: "tooShort" } });
    expect(validateContact({ ...valid, message: "x".repeat(5001) })).toMatchObject({ errors: { message: "tooLong" } });
  });
});

describe("createRateLimiter", () => {
  it("allows `limit` hits per window per key, then resets", () => {
    const limiter = createRateLimiter(2, 1000);
    expect([limiter.hit("a", 0), limiter.hit("a", 1), limiter.hit("a", 2)]).toEqual([true, true, false]);
    expect(limiter.hit("b", 2)).toBe(true);
    expect(limiter.hit("a", 1001)).toBe(true);
  });
});

describe("POST /api/contact", () => {
  let counter = 0;
  const fetchMock = vi.fn();

  const post = (body: unknown, headers: Record<string, string> = {}) =>
    POST(
      new Request("https://site.example/api/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "https://site.example",
          host: "site.example",
          // A distinct visitor per request keeps the in-memory rate limit out of unrelated tests.
          "x-forwarded-for": `10.0.0.${++counter}`,
          ...headers,
        },
        body: typeof body === "string" ? body : JSON.stringify(body),
      }),
    );
  const payload = (extra: Record<string, unknown> = {}) => ({
    ...valid,
    website: "",
    startedAt: Date.now() - 10_000,
    idempotencyKey: "key-12345678",
    ...extra,
  });

  beforeEach(() => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.stubEnv("CONTACT_TO_EMAIL", "owner@example.com");
    fetchMock.mockReset().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("delivers through the provider and reports success only then", async () => {
    const response = await post(payload());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.headers.Authorization).toBe("Bearer re_test_key");
    expect(init.headers["Idempotency-Key"]).toBe("key-12345678");
    const sent = JSON.parse(init.body);
    expect(sent).toMatchObject({ to: ["owner@example.com"], reply_to: "ada@example.com", subject: "[Portfolio] Hello" });
    expect(sent.text).toContain("I'd like to talk about a project.");
  });

  it("does not claim success when the provider rejects the message", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 403 }));
    const response = await post(payload());
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ ok: false, code: "delivery_failed" });
  });

  it("does not claim success when the provider is unreachable", async () => {
    fetchMock.mockRejectedValue(new Error("network"));
    expect((await post(payload())).status).toBe(502);
  });

  it("reports unavailable, and sends nothing, when no provider is configured", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const response = await post(payload());
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ ok: false, code: "unavailable" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns field errors for invalid input", async () => {
    const response = await post(payload({ email: "nope" }));
    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({ ok: false, code: "invalid", errors: { email: "invalid" } });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("silently drops honeypot submissions without sending", async () => {
    const response = await post(payload({ website: "http://spam.example" }));
    expect(response.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects messages submitted faster than a person could write them", async () => {
    const response = await post(payload({ startedAt: Date.now() - 200 }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, code: "spam" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects cross-origin and origin-less posts", async () => {
    expect((await post(payload(), { origin: "https://evil.example" })).status).toBe(403);
    expect((await post(payload(), { origin: "" })).status).toBe(403);
  });

  it("rejects malformed and oversized bodies", async () => {
    expect((await post("{not json")).status).toBe(400);
    expect((await post("[]")).status).toBe(400);
    expect((await post(JSON.stringify({ message: "x".repeat(30_000) }))).status).toBe(413);
  });

  it("rate limits one visitor", async () => {
    const same = { "x-forwarded-for": "203.0.113.9" };
    const statuses = [];
    for (let i = 0; i < 4; i += 1) statuses.push((await post(payload(), same)).status);
    expect(statuses).toEqual([200, 200, 200, 429]);
  });
});
