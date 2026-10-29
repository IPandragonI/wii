import { DEFAULT_LOCALE, INTL_LOCALE, type Locale } from "@/i18n/config";

/** Formats an ISO timestamp for server-rendered pages. Returns undefined for missing or invalid input. */
export function formatDate(iso: string | undefined, locale: Locale = DEFAULT_LOCALE): string | undefined {
  if (!iso) return undefined;
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return undefined;
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], { dateStyle: "medium", timeZone: "UTC" }).format(time);
}

export function formatCount(value: number | undefined, locale: Locale = DEFAULT_LOCALE): string | undefined {
  return value === undefined ? undefined : new Intl.NumberFormat(INTL_LOCALE[locale], { notation: "compact" }).format(value);
}
