import "server-only";

import type { FetchLike } from "@/lib/http";
import { safeImageSrc } from "@/lib/url";

/**
 * Reads a project's production page once per sync for what the site says about itself:
 *
 * - its title and description, which tell the banner which theme fits (a chess analyser,
 *   a guitar tuner, a car quiz...), whatever language they are written in;
 * - its og:image / twitter:image, shown on the project's own page;
 * - its theme-color, used as the banner accent when it is readable.
 */

export interface SiteInfo {
  text?: string;
  image?: string;
  color?: string;
}

const MAX_HTML = 512 * 1024;
const TIMEOUT_MS = 6_000;
const COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

function attributes(tag: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const match of tag.matchAll(/([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g)) {
    result[match[1].toLowerCase()] = (match[2] ?? match[3] ?? match[4] ?? "").trim();
  }
  return result;
}

function decodeEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** Relative luminance (WCAG) of a #rgb or #rrggbb color. */
export function luminance(hex: string): number {
  const full = hex.length === 4 ? hex.replace(/[0-9a-f]/gi, (digit) => digit + digit) : hex;
  const [r, g, b] = [1, 3, 5].map((index) => {
    const channel = parseInt(full.slice(index, index + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Site colors become banner accents, so near-white or near-black ones are not used. */
function usableAccent(value: string | undefined): string | undefined {
  if (!value || !COLOR.test(value)) return undefined;
  const light = luminance(value);
  return light >= 0.03 && light <= 0.6 ? value.toLowerCase() : undefined;
}

/** Extracts the title, description, og:image, and theme-color from a page's <head>. */
export function parseSiteMetadata(html: string, pageUrl: string): SiteInfo {
  const head = html.slice(0, MAX_HTML).split(/<\/head>/i)[0];
  const resolve = (href: string | undefined) => {
    if (!href) return undefined;
    try {
      return safeImageSrc(new URL(href, pageUrl).href);
    } catch {
      return undefined;
    }
  };

  const title = head.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1];
  let description: string | undefined;
  let image: string | undefined;
  let color: string | undefined;
  for (const [tag] of head.matchAll(/<meta\b[^>]*>/gi)) {
    const meta = attributes(tag);
    const key = (meta.property ?? meta.name ?? "").toLowerCase();
    if (!description && (key === "description" || key === "og:description")) description = meta.content;
    if (!image && (key === "og:image" || key === "og:image:url" || key === "twitter:image")) image = resolve(meta.content);
    if (!color && key === "theme-color") color = usableAccent(meta.content);
  }

  const text = decodeEntities([title, description].filter(Boolean).join(" ")).replace(/\s+/g, " ").trim().slice(0, 500);
  return { text: text || undefined, image, color };
}

export async function probeSite(
  url: string,
  options: { fetchImpl?: FetchLike; revalidate?: number; tags?: string[] } = {},
): Promise<SiteInfo | null> {
  const fetchImpl = options.fetchImpl ?? fetch;
  try {
    const response = await fetchImpl(url, {
      headers: { Accept: "text/html", "User-Agent": "wii-portfolio-preview" },
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: options.revalidate, tags: options.tags },
    });
    if (!response.ok || !(response.headers.get("content-type") ?? "").includes("text/html")) return null;
    return parseSiteMetadata(await response.text(), response.url || url);
  } catch {
    // Unreachable or slow: the banner keeps the theme inferred from GitHub data.
    return null;
  }
}
