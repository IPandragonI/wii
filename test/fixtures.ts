import type { FetchLike } from "@/lib/http";
import type { DiscoveryRules } from "@/types/config";
import type { GitHubRepository, VercelDeploymentInfo, VercelProjectInfo } from "@/types/providers";

export function rawRepository(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  const id = (overrides.id as number | undefined) ?? 1;
  const name = (overrides.name as string | undefined) ?? `repo-${id}`;
  return {
    id,
    name,
    full_name: `octo/${name}`,
    owner: { login: "octo" },
    description: "A repository",
    html_url: `https://github.com/octo/${name}`,
    homepage: null,
    default_branch: "main",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
    pushed_at: "2026-10-01T00:00:00Z",
    language: "TypeScript",
    topics: [],
    stargazers_count: 3,
    forks_count: 1,
    archived: false,
    fork: false,
    private: false,
    ...overrides,
  };
}

export function repository(overrides: Partial<GitHubRepository> = {}): GitHubRepository {
  const id = overrides.id ?? 1;
  const name = overrides.name ?? `repo-${id}`;
  return {
    id,
    name,
    fullName: `octo/${name}`,
    owner: "octo",
    description: "A repository",
    htmlUrl: `https://github.com/octo/${name}`,
    homepage: null,
    defaultBranch: "main",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-10-01T00:00:00Z",
    pushedAt: "2026-10-01T00:00:00Z",
    language: "TypeScript",
    topics: [],
    stars: 3,
    forks: 1,
    archived: false,
    fork: false,
    isPrivate: false,
    ...overrides,
  };
}

export function deployment(overrides: Partial<VercelDeploymentInfo> = {}): VercelDeploymentInfo {
  return {
    id: "dpl_1",
    url: "app-abc123-octo.vercel.app",
    readyState: "READY",
    target: "production",
    createdAt: Date.parse("2026-10-02T00:00:00Z"),
    aliases: [],
    ...overrides,
  };
}

export function vercelProject(overrides: Partial<VercelProjectInfo> = {}): VercelProjectInfo {
  return {
    id: "prj_1",
    name: "app",
    link: null,
    productionDomains: [],
    deployments: [],
    ...overrides,
  };
}

export const rules: DiscoveryRules = {
  includeForks: false,
  includeArchived: false,
  autoDiscover: true,
  hiddenRepositories: [],
  recentLimit: 12,
  menuFeaturedLimit: 6,
};

export function jsonResponse(body: unknown, init: { status?: number; headers?: Record<string, string> } = {}): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { "content-type": "application/json", ...init.headers },
  });
}

/** A fetch stub that routes by URL substring and records every call. */
export function routeFetch(routes: [match: string, respond: () => Response | Promise<Response>][]) {
  const calls: { url: string; init?: RequestInit }[] = [];
  const fetchImpl: FetchLike = async (url, init) => {
    calls.push({ url, init });
    const route = routes.find(([match]) => url.includes(match));
    if (!route) throw new Error(`Unexpected request: ${url}`);
    return route[1]();
  };
  return { fetchImpl, calls };
}
