/** Public, non-secret site settings. */

const FALLBACK_SITE_URL = "http://localhost:3000";

function resolveSiteUrl(): URL {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`,
  ];
  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      return new URL(candidate);
    } catch {
      // Ignore malformed values and fall through to the next candidate.
    }
  }
  return new URL(FALLBACK_SITE_URL);
}

export const siteUrl = resolveSiteUrl();

/** How often provider data is refreshed, in seconds. */
export const SYNC_INTERVAL_SECONDS = 30 * 60;

export const PORTFOLIO_CACHE_TAG = "portfolio";
