import type { MetadataRoute } from "next";

import { linkedinUrl } from "@/config/profile";
import { siteUrl } from "@/config/site";
import { LOCALES, localePath } from "@/i18n/config";
import { getPortfolio } from "@/lib/portfolio";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects } = await getPortfolio();
  const url = (path: string) => new URL(path, siteUrl).href;
  const pages = ["/", "/projects", "/github", "/about", ...(linkedinUrl() ? ["/linkedin"] : []), "/contact"];

  // Each page is listed once per language, with hreflang alternates pointing at its translations.
  const entry = (path: string, lastModified?: string) =>
    LOCALES.map((locale) => ({
      url: url(localePath(locale, path)),
      ...(lastModified ? { lastModified } : {}),
      alternates: { languages: Object.fromEntries(LOCALES.map((other) => [other, url(localePath(other, path))])) },
    }));

  return [
    ...pages.flatMap((path) => entry(path)),
    ...projects.flatMap((project) => entry(`/projects/${project.slug}`, project.lastUpdatedAt)),
  ];
}
