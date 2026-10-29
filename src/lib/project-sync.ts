import "server-only";

import { fetchPublicRepositories, fetchRepositoryLanguages, isValidGitHubUsername } from "@/lib/github";
import type { FetchLike } from "@/lib/http";
import { bannerFromText, buildFallbackPortfolio, buildPortfolio, compareByRecency, decideVisibility, findOverride, indexOverrides } from "@/lib/project-normalizer";
import { probeSite } from "@/lib/site-probe";
import { fetchVercelProjects } from "@/lib/vercel";
import { PORTFOLIO_CACHE_TAG, SYNC_INTERVAL_SECONDS } from "@/config/site";
import type { DiscoveryRules, FallbackProject, ProjectOverride } from "@/types/config";
import type { PortfolioData, PortfolioProject, ProviderIssue } from "@/types/project";
import type { VercelProjectInfo } from "@/types/providers";

/** Upper bound on per-repository language lookups per sync, to protect the rate limit. */
const MAX_LANGUAGE_LOOKUPS = 12;
/** Upper bound on production sites probed per sync. */
const MAX_SITE_PROBES = 16;

export interface SyncEnvironment {
  githubUsername?: string;
  githubToken?: string;
  vercelToken?: string;
  vercelTeamId?: string;
}

export interface SyncConfig {
  overrides: ProjectOverride[];
  rules: DiscoveryRules;
  fallback: FallbackProject[];
}

export interface SyncOptions {
  fetchImpl?: FetchLike;
  now?: () => Date;
}

/**
 * Adds what each production site says about itself: its og:image and theme color, and, for
 * projects whose banner only came from the category default, a theme inferred from the
 * site's own title and description. The internal `bannerFallback` flag is removed.
 */
export async function enrichWithSiteInfo(
  projects: PortfolioProject[],
  options: { fetchImpl?: FetchLike; revalidate?: number; tags?: string[] },
): Promise<PortfolioProject[]> {
  const probed = new Set(projects.filter((project) => project.productionUrl).slice(0, MAX_SITE_PROBES).map((p) => p.id));
  return Promise.all(
    projects.map(async ({ bannerFallback, ...project }) => {
      if (!project.productionUrl || !probed.has(project.id)) return project;
      const site = await probeSite(project.productionUrl, options);
      return {
        ...project,
        banner: (bannerFallback && bannerFromText(site?.text)) || project.banner,
        siteImage: site?.image,
        siteColor: site?.color,
      };
    }),
  );
}

export function readSyncEnvironment(env: NodeJS.ProcessEnv = process.env): SyncEnvironment {
  const value = (key: string) => env[key]?.trim() || undefined;
  return {
    githubUsername: value("GITHUB_USERNAME"),
    githubToken: value("GITHUB_TOKEN"),
    vercelToken: value("VERCEL_TOKEN"),
    vercelTeamId: value("VERCEL_TEAM_ID"),
  };
}

/**
 * Runs the full pipeline: GitHub -> Vercel -> match -> overrides -> visibility -> sort.
 * Never throws for provider failures; every problem is reported in `issues` instead.
 */
export async function syncPortfolio(
  env: SyncEnvironment,
  config: SyncConfig,
  options: SyncOptions = {},
): Promise<PortfolioData> {
  const now = (options.now ?? (() => new Date()))().toISOString();
  const cache = { revalidate: SYNC_INTERVAL_SECONDS, tags: [PORTFOLIO_CACHE_TAG], fetchImpl: options.fetchImpl };
  const issues: ProviderIssue[] = [];
  const vercelEnabled = Boolean(env.vercelToken);
  const githubProfileUrl =
    env.githubUsername && isValidGitHubUsername(env.githubUsername)
      ? `https://github.com/${env.githubUsername}`
      : undefined;

  const fallback = (extra: ProviderIssue[]): PortfolioData => {
    const projects = buildFallbackPortfolio(config.fallback);
    return {
      projects,
      recent: [...projects].sort(compareByRecency).slice(0, config.rules.recentLimit),
      source: "fallback",
      lastSyncedAt: now,
      issues: [...issues, ...extra],
      vercelEnabled,
      githubProfileUrl,
    };
  };

  if (!env.githubUsername) {
    return fallback([{ provider: "config", message: "GITHUB_USERNAME is not set; showing sample data", transient: false }]);
  }

  let githubToken = env.githubToken;
  const [firstGithub, vercel] = await Promise.all([
    fetchPublicRepositories(env.githubUsername, { ...cache, token: githubToken }),
    env.vercelToken
      ? fetchVercelProjects({ ...cache, token: env.vercelToken, teamId: env.vercelTeamId })
      : Promise.resolve(null),
  ]);

  // A rejected token would also block public data, so fall back to unauthenticated requests.
  let github = firstGithub;
  if (!github.ok && githubToken && github.error.includes("HTTP 401")) {
    issues.push({ provider: "github", message: "GITHUB_TOKEN was rejected; using unauthenticated requests", transient: false });
    githubToken = undefined;
    github = await fetchPublicRepositories(env.githubUsername, cache);
  }

  if (!github.ok) {
    return fallback([{ provider: "github", message: github.error, transient: github.transient }]);
  }

  let vercelProjects: VercelProjectInfo[] | null = null;
  if (vercel?.ok) vercelProjects = vercel.data;
  else if (vercel) issues.push({ provider: "vercel", message: vercel.error, transient: vercel.transient });

  // Only curated repositories get the extra languages request; the rest use their primary language.
  const { index } = indexOverrides(config.overrides);
  const curated = github.data
    .filter((repository) => {
      const override = findOverride(index, repository);
      return override && decideVisibility(repository, override, config.rules) !== "hidden";
    })
    .slice(0, MAX_LANGUAGE_LOOKUPS);
  const languageResults = await Promise.all(
    curated.map(async (repository) => {
      const result = await fetchRepositoryLanguages(repository.owner, repository.name, {
        ...cache,
        token: githubToken,
      });
      return [repository.id, result.ok ? result.data : undefined] as const;
    }),
  );
  const languages = new Map<number, string[]>();
  for (const [id, list] of languageResults) if (list) languages.set(id, list);

  const built = buildPortfolio({
    repositories: github.data,
    vercelProjects,
    overrides: config.overrides,
    rules: config.rules,
    languages,
  });

  const projects = await enrichWithSiteInfo(built.projects, cache);
  const byId = new Map(projects.map((project) => [project.id, project]));

  return {
    projects,
    recent: built.recent.map((project) => byId.get(project.id) ?? project),
    source: "live",
    lastSyncedAt: now,
    issues: [...issues, ...built.issues],
    vercelEnabled,
    githubProfileUrl,
  };
}

/**
 * During a runtime revalidation, a transient failure (timeout, 5xx, rate limit) should not
 * replace a good cached page with degraded data. Throwing makes Next.js keep serving the last
 * successfully generated version and retry on a later request. During the build there is no
 * previous version, so degraded data is used instead.
 */
export function shouldPreserveStale(data: PortfolioData, env: NodeJS.ProcessEnv = process.env): boolean {
  const isRuntime = env.NODE_ENV === "production" && env.NEXT_PHASE !== "phase-production-build";
  return isRuntime && data.issues.some((issue) => issue.transient);
}
