/**
 * Languages. English lives at the original URLs ("/about"); French under "/fr" ("/fr/about").
 * Both are prerendered, and pages link to each other with hreflang alternates.
 */
export const LOCALES = ["en", "fr"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/** BCP 47 tags for Intl date and number formatting. */
export const INTL_LOCALE: Record<Locale, string> = { en: "en-US", fr: "fr-FR" };

/** The path of a page in a given language: localePath("fr", "/about") === "/fr/about". */
export function localePath(locale: Locale, path: string): string {
  if (locale === DEFAULT_LOCALE) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** Splits "/fr/about" into { locale: "fr", path: "/about" }. */
export function parseLocalePath(pathname: string): { locale: Locale; path: string } {
  for (const locale of LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    if (pathname === `/${locale}`) return { locale, path: "/" };
    if (pathname.startsWith(`/${locale}/`)) return { locale, path: pathname.slice(locale.length + 1) };
  }
  return { locale: DEFAULT_LOCALE, path: pathname || "/" };
}

/** Canonical and hreflang alternates for a page, for the Next.js metadata API. */
export function alternatesFor(locale: Locale, path: string) {
  return {
    canonical: localePath(locale, path),
    languages: Object.fromEntries(LOCALES.map((other) => [other, localePath(other, path)])),
  };
}
