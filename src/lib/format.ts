const DATE_FORMAT = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

/** Formats an ISO timestamp for server-rendered pages. Returns undefined for missing or invalid input. */
export function formatDate(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  const time = Date.parse(iso);
  return Number.isNaN(time) ? undefined : DATE_FORMAT.format(time);
}

export function formatCount(value: number | undefined): string | undefined {
  return value === undefined ? undefined : new Intl.NumberFormat("en-US", { notation: "compact" }).format(value);
}
