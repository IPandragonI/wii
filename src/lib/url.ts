/**
 * Returns a normalized http(s) URL, or undefined for anything else (javascript:, data:,
 * embedded credentials, malformed input). Use for every externally sourced link.
 */
export function safeExternalUrl(value: string | null | undefined, allowedHosts?: string[]): string | undefined {
  if (!value) return undefined;
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return undefined;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
  if (url.username || url.password) return undefined;
  if (allowedHosts && !allowedHosts.includes(url.hostname.toLowerCase())) return undefined;
  return url.href;
}

/**
 * Image sources may be site-relative paths (served from /public) or https URLs.
 */
export function safeImageSrc(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("..")) return trimmed;
  const external = safeExternalUrl(trimmed);
  return external?.startsWith("https:") ? external : undefined;
}

const HOSTNAME = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

export function isValidHostname(value: string): boolean {
  return HOSTNAME.test(value);
}

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

/** "kart-racing_v2" -> "Kart Racing V2" */
export function prettifyRepositoryName(name: string): string {
  return name
    .replace(/[-_.]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
