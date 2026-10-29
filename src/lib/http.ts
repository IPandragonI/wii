import type { ProviderResult } from "@/types/providers";

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export interface JsonRequest {
  url: string;
  headers?: Record<string, string>;
  /** Seconds to keep the response in the Next.js data cache. Only 200 responses are cached. */
  revalidate?: number;
  tags?: string[];
  timeoutMs?: number;
  fetchImpl?: FetchLike;
}

export interface JsonResponse {
  body: unknown;
  headers: Headers;
}

const DEFAULT_TIMEOUT_MS = 8_000;

/**
 * GET a JSON document and classify failures. Error messages are built from the status code
 * and URL path only, so request headers (and the credentials in them) are never echoed.
 */
export async function getJson(request: JsonRequest): Promise<ProviderResult<JsonResponse>> {
  const fetchImpl = request.fetchImpl ?? fetch;
  const label = describeUrl(request.url);

  let response: Response;
  try {
    response = await fetchImpl(request.url, {
      method: "GET",
      headers: request.headers,
      signal: AbortSignal.timeout(request.timeoutMs ?? DEFAULT_TIMEOUT_MS),
      next: { revalidate: request.revalidate, tags: request.tags },
    });
  } catch (error) {
    const reason = error instanceof Error && error.name === "TimeoutError" ? "timed out" : "network error";
    return { ok: false, error: `${label}: ${reason}`, transient: true };
  }

  if (!response.ok) {
    return {
      ok: false,
      error: `${label}: HTTP ${response.status}${isRateLimited(response) ? " (rate limited)" : ""}`,
      transient: isTransientStatus(response),
    };
  }

  try {
    return { ok: true, data: { body: await response.json(), headers: response.headers } };
  } catch {
    return { ok: false, error: `${label}: invalid JSON`, transient: true };
  }
}

function isRateLimited(response: Response): boolean {
  if (response.status === 429) return true;
  return response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0";
}

function isTransientStatus(response: Response): boolean {
  return response.status >= 500 || response.status === 408 || isRateLimited(response);
}

function describeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname}`;
  } catch {
    return "request";
  }
}
