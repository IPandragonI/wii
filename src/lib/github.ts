import "server-only";

import { z } from "zod";

import { getJson, type FetchLike } from "@/lib/http";
import type { GitHubRepository, ProviderResult } from "@/types/providers";

const API_ROOT = "https://api.github.com";
const MAX_PAGES = 10;
const USERNAME = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

export interface GitHubClientOptions {
  token?: string;
  revalidate?: number;
  tags?: string[];
  fetchImpl?: FetchLike;
}

const repositorySchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  full_name: z.string(),
  owner: z.object({ login: z.string() }),
  description: z.string().nullable(),
  html_url: z.string(),
  homepage: z.string().nullable().optional(),
  default_branch: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  pushed_at: z.string().nullable().optional(),
  language: z.string().nullable().optional(),
  topics: z.array(z.string()).optional(),
  stargazers_count: z.number().int().nonnegative(),
  forks_count: z.number().int().nonnegative(),
  archived: z.boolean(),
  fork: z.boolean(),
  private: z.boolean(),
});

const languagesSchema = z.record(z.string(), z.number().nonnegative());

export function isValidGitHubUsername(username: string): boolean {
  return USERNAME.test(username);
}

export function normalizeRepository(raw: z.infer<typeof repositorySchema>): GitHubRepository {
  return {
    id: raw.id,
    name: raw.name,
    fullName: raw.full_name,
    owner: raw.owner.login,
    description: raw.description?.trim() || null,
    htmlUrl: raw.html_url,
    homepage: raw.homepage?.trim() || null,
    defaultBranch: raw.default_branch,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    pushedAt: raw.pushed_at ?? null,
    language: raw.language ?? null,
    topics: raw.topics ?? [],
    stars: raw.stargazers_count,
    forks: raw.forks_count,
    archived: raw.archived,
    fork: raw.fork,
    isPrivate: raw.private,
  };
}

/** Parses one page of `/users/{username}/repos`. Malformed entries are dropped, not fatal. */
export function parseRepositoryPage(body: unknown): { repositories: GitHubRepository[]; dropped: number } | null {
  if (!Array.isArray(body)) return null;
  const repositories: GitHubRepository[] = [];
  let dropped = 0;
  for (const item of body) {
    const parsed = repositorySchema.safeParse(item);
    if (parsed.success && !parsed.data.private) repositories.push(normalizeRepository(parsed.data));
    else dropped += 1;
  }
  return { repositories, dropped };
}

/** Extracts the `rel="next"` URL from a GitHub `Link` header, restricted to the API host. */
export function nextPageUrl(linkHeader: string | null): string | null {
  if (!linkHeader) return null;
  for (const part of linkHeader.split(",")) {
    const match = part.match(/<([^>]+)>\s*;\s*rel="next"/);
    if (!match) continue;
    try {
      const url = new URL(match[1]);
      return url.origin === API_ROOT ? url.href : null;
    } catch {
      return null;
    }
  }
  return null;
}

function headers(token?: string): Record<string, string> {
  const result: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "wii-portfolio",
  };
  if (token) result.Authorization = `Bearer ${token}`;
  return result;
}

/**
 * Lists every public repository owned by `username`, following pagination.
 * Only public repositories are requested and any private entry is discarded defensively.
 */
export async function fetchPublicRepositories(
  username: string,
  options: GitHubClientOptions = {},
): Promise<ProviderResult<GitHubRepository[]>> {
  if (!isValidGitHubUsername(username)) {
    return { ok: false, error: "GITHUB_USERNAME is not a valid GitHub username", transient: false };
  }

  const repositories: GitHubRepository[] = [];
  let url: string | null =
    `${API_ROOT}/users/${encodeURIComponent(username)}/repos?type=owner&sort=pushed&per_page=100`;

  for (let page = 0; url && page < MAX_PAGES; page += 1) {
    const result = await getJson({
      url,
      headers: headers(options.token),
      revalidate: options.revalidate,
      tags: options.tags,
      fetchImpl: options.fetchImpl,
    });
    if (!result.ok) {
      const hint = result.error.includes("HTTP 404") ? " (unknown user?)" : "";
      return { ok: false, error: `GitHub ${result.error}${hint}`, transient: result.transient };
    }

    const parsed = parseRepositoryPage(result.data.body);
    if (!parsed) return { ok: false, error: "GitHub returned an unexpected repository list", transient: true };

    repositories.push(...parsed.repositories);
    url = nextPageUrl(result.data.headers.get("link"));
  }

  return { ok: true, data: dedupeById(repositories) };
}

/** Language names ordered by bytes of code, largest first. */
export async function fetchRepositoryLanguages(
  owner: string,
  name: string,
  options: GitHubClientOptions = {},
): Promise<ProviderResult<string[]>> {
  const result = await getJson({
    url: `${API_ROOT}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/languages`,
    headers: headers(options.token),
    revalidate: options.revalidate,
    tags: options.tags,
    fetchImpl: options.fetchImpl,
  });
  if (!result.ok) return { ok: false, error: `GitHub ${result.error}`, transient: result.transient };

  const parsed = languagesSchema.safeParse(result.data.body);
  if (!parsed.success) return { ok: false, error: "GitHub returned unexpected language data", transient: true };

  return {
    ok: true,
    data: Object.entries(parsed.data)
      .sort(([, a], [, b]) => b - a)
      .map(([language]) => language),
  };
}

function dedupeById(repositories: GitHubRepository[]): GitHubRepository[] {
  const seen = new Map<number, GitHubRepository>();
  for (const repository of repositories) seen.set(repository.id, repository);
  return [...seen.values()];
}
