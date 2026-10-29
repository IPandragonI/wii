import type { MetadataRoute } from "next";

import { siteUrl } from "@/config/site";
import { getPortfolio } from "@/lib/portfolio";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects } = await getPortfolio();
  const url = (path: string) => new URL(path, siteUrl).href;
  return [
    ...["/", "/projects", "/github", "/about", "/contact"].map((path) => ({ url: url(path) })),
    ...projects.map((project) => ({
      url: url(`/projects/${project.slug}`),
      lastModified: project.lastUpdatedAt,
    })),
  ];
}
