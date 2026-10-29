import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { discoveryRules, fallbackProjects, projectOverrides } from "@/config/projects";
import { PORTFOLIO_CACHE_TAG } from "@/config/site";
import { readSyncEnvironment, shouldPreserveStale, syncPortfolio } from "@/lib/project-sync";
import type { PortfolioData, PortfolioProject } from "@/types/project";

/**
 * The single entry point the app uses for project data.
 *
 * Caching layers:
 *   1. Each GitHub/Vercel request goes through the Next.js data cache (30 min). On Vercel that
 *      cache is durable and shared by all function instances, and only 200 responses are stored.
 *   2. This function is cached with the `portfolio` profile, so pages that use it are
 *      prerendered and regenerated in the background (ISR) roughly every 30 minutes.
 */
export async function getPortfolio(): Promise<PortfolioData> {
  "use cache";
  cacheLife("portfolio");
  cacheTag(PORTFOLIO_CACHE_TAG);

  const data = await syncPortfolio(readSyncEnvironment(), {
    overrides: projectOverrides,
    rules: discoveryRules,
    fallback: fallbackProjects,
  });

  for (const issue of data.issues) {
    console.warn(`[portfolio] ${issue.provider}: ${issue.message}`);
  }

  if (shouldPreserveStale(data)) {
    throw new Error("Project providers are temporarily unavailable; keeping the previous cached portfolio.");
  }
  return data;
}

export async function getProjectBySlug(slug: string): Promise<PortfolioProject | undefined> {
  const { projects } = await getPortfolio();
  return projects.find((project) => project.slug === slug);
}

export function featuredForMenu(data: PortfolioData): PortfolioProject[] {
  const featured = data.projects.filter((project) => project.featured);
  // With nothing curated yet, the most recent work fills the menu instead.
  const source = featured.length ? featured : data.recent;
  return source.slice(0, discoveryRules.menuFeaturedLimit);
}
