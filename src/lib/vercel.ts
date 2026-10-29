import "server-only";

import { z } from "zod";

import { getJson, type FetchLike } from "@/lib/http";
import { isValidHostname, safeExternalUrl } from "@/lib/url";
import type {
  ProviderResult,
  VercelDeploymentInfo,
  VercelProductionSummary,
  VercelProjectInfo,
  VercelReadyState,
} from "@/types/providers";

const API_ROOT = "https://api.vercel.com";
const MAX_PAGES = 10;

export interface VercelClientOptions {
  token: string;
  teamId?: string;
  revalidate?: number;
  tags?: string[];
  fetchImpl?: FetchLike;
}

const READY_STATES = ["BLOCKED", "BUILDING", "CANCELED", "DELETED", "ERROR", "INITIALIZING", "QUEUED", "READY"] as const;

const deploymentSchema = z.object({
  id: z.string().optional(),
  uid: z.string().optional(),
  url: z.string(),
  readyState: z.enum(READY_STATES),
  target: z.string().nullable().optional(),
  createdAt: z.number(),
  alias: z.array(z.string()).nullable().optional(),
});

const aliasSchema = z.object({
  domain: z.string(),
  environment: z.string().nullable().optional(),
  target: z.string().nullable().optional(),
  redirect: z.string().nullable().optional(),
});

const linkSchema = z.object({
  type: z.string(),
  org: z.string().optional(),
  repo: z.string().optional(),
  repoId: z.number().optional(),
});

// Nested fields are `unknown` here and validated item by item below, so one odd
// deployment record cannot discard the whole project.
const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  link: z.unknown().optional(),
  alias: z.unknown().optional(),
  targets: z.unknown().optional(),
  latestDeployments: z.unknown().optional(),
});

const projectListSchema = z.object({
  projects: z.array(z.unknown()),
  pagination: z.object({ next: z.number().nullable().optional() }).partial().optional(),
});

function parseDeployment(value: unknown): VercelDeploymentInfo | null {
  const parsed = deploymentSchema.safeParse(value);
  if (!parsed.success) return null;
  const { id, uid, url, readyState, target, createdAt, alias } = parsed.data;
  return { id: id ?? uid ?? url, url, readyState, target: target ?? null, createdAt, aliases: alias ?? [] };
}

export function parseVercelProject(value: unknown): VercelProjectInfo | null {
  const parsed = projectSchema.safeParse(value);
  if (!parsed.success) return null;
  const project = parsed.data;

  const link = linkSchema.safeParse(project.link);

  const productionDomains = Array.isArray(project.alias)
    ? project.alias.flatMap((entry) => {
        const alias = aliasSchema.safeParse(entry);
        if (!alias.success || alias.data.redirect) return [];
        const isProduction =
          alias.data.environment === "production" || alias.data.target?.toUpperCase() === "PRODUCTION";
        return isProduction ? [alias.data.domain.toLowerCase()] : [];
      })
    : [];

  const rawDeployments: unknown[] = [];
  if (project.targets && typeof project.targets === "object") {
    const production = (project.targets as Record<string, unknown>).production;
    if (production) rawDeployments.push(production);
  }
  if (Array.isArray(project.latestDeployments)) rawDeployments.push(...project.latestDeployments);

  const deployments = new Map<string, VercelDeploymentInfo>();
  for (const raw of rawDeployments) {
    const deployment = parseDeployment(raw);
    if (deployment) deployments.set(deployment.id, deployment);
  }

  return {
    id: project.id,
    name: project.name,
    link: link.success ? link.data : null,
    productionDomains: [...new Set(productionDomains)],
    deployments: [...deployments.values()],
  };
}

/** Branch aliases such as `app-git-feature-team.vercel.app` point at previews, never production. */
function isBranchAlias(domain: string): boolean {
  return domain.endsWith(".vercel.app") && domain.includes("-git-");
}

function domainRank(domain: string): [number, number, number, string] {
  const isVercelApp = domain.endsWith(".vercel.app") ? 1 : 0;
  const isWww = domain.startsWith("www.") ? 1 : 0;
  return [isVercelApp, isWww, domain.length, domain];
}

function compareDomains(a: string, b: string): number {
  const ra = domainRank(a);
  const rb = domainRank(b);
  for (let i = 0; i < ra.length; i += 1) {
    if (ra[i] < rb[i]) return -1;
    if (ra[i] > rb[i]) return 1;
  }
  return 0;
}

/**
 * Chooses what the portfolio shows for a Vercel project.
 *
 * - Only `target === "production"` deployments are considered; previews never qualify.
 * - The URL is only offered when at least one production deployment is READY. Building,
 *   queued, failed, and canceled deployments do not count as available.
 * - The URL is a production domain, never the unique per-deployment URL: custom domains
 *   first (apex before www), then the shortest `*.vercel.app` domain.
 */
export function selectProduction(project: VercelProjectInfo): VercelProductionSummary {
  const production = project.deployments
    .filter((deployment) => deployment.target === "production")
    .sort((a, b) => b.createdAt - a.createdAt);

  const latestProductionState: VercelReadyState | undefined = production[0]?.readyState;
  const ready = production.find((deployment) => deployment.readyState === "READY");
  if (!ready) return { latestProductionState };

  const candidates = [...project.productionDomains, ...ready.aliases.map((alias) => alias.toLowerCase())].filter(
    (domain) => isValidHostname(domain) && !isBranchAlias(domain),
  );
  const domain = [...new Set(candidates)].sort(compareDomains)[0];

  return {
    productionUrl: domain ? safeExternalUrl(`https://${domain}`) : undefined,
    lastDeploymentAt: new Date(ready.createdAt).toISOString(),
    latestProductionState,
  };
}

/** Lists all projects visible to the token (scoped to `teamId` when provided). */
export async function fetchVercelProjects(options: VercelClientOptions): Promise<ProviderResult<VercelProjectInfo[]>> {
  const projects: VercelProjectInfo[] = [];
  let from: number | null = null;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const params = new URLSearchParams({ limit: "100" });
    if (options.teamId) params.set("teamId", options.teamId);
    if (from !== null) params.set("from", String(from));

    const result = await getJson({
      url: `${API_ROOT}/v10/projects?${params}`,
      headers: { Authorization: `Bearer ${options.token}` },
      revalidate: options.revalidate,
      tags: options.tags,
      fetchImpl: options.fetchImpl,
    });
    if (!result.ok) {
      const hint = /HTTP (401|403)/.test(result.error) && !result.transient ? " (check VERCEL_TOKEN / VERCEL_TEAM_ID)" : "";
      return { ok: false, error: `Vercel ${result.error}${hint}`, transient: result.transient };
    }

    const parsed = projectListSchema.safeParse(result.data.body);
    if (!parsed.success) return { ok: false, error: "Vercel returned an unexpected project list", transient: true };

    for (const raw of parsed.data.projects) {
      const project = parseVercelProject(raw);
      if (project) projects.push(project);
    }

    const next = parsed.data.pagination?.next ?? null;
    if (next === null || next === from) break;
    from = next;
  }

  return { ok: true, data: projects };
}
