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

// ---------------------------------------------------------------------------------------------
// GitHub Lists
//
// A "list" is one of the named collections on a user's Stars page. REST has no endpoint for
// them; GraphQL exposes them as `User.lists`. GraphQL always needs a token, even for public data.

const GRAPHQL_URL = `${API_ROOT}/graphql`;
const MAX_LIST_PAGES = 20;

const listsQuery = `query($login: String!) {
  user(login: $login) { lists(first: 100) { nodes { id name slug } } }
}`;
const itemsQuery = `query($id: ID!, $after: String) {
  node(id: $id) { ... on UserList { items(first: 100, after: $after) {
    pageInfo { hasNextPage endCursor }
    nodes { __typename ... on Repository { databaseId isPrivate } }
  } } }
}`;

const listsSchema = z.object({
  data: z.object({ user: z.object({ lists: z.object({ nodes: z.array(z.object({ id: z.string(), name: z.string(), slug: z.string() })) }) }).nullable() }),
});
const itemsSchema = z.object({
  data: z.object({
    node: z
      .object({
        items: z.object({
          pageInfo: z.object({ hasNextPage: z.boolean(), endCursor: z.string().nullable() }),
          nodes: z.array(z.object({ __typename: z.string(), databaseId: z.number().optional(), isPrivate: z.boolean().optional() }).nullable()),
        }),
      })
      .nullable(),
  }),
});

/** True when the GraphQL response reports errors (they arrive with HTTP 200). */
function graphqlErrors(body: unknown): string | null {
  const errors = (body as { errors?: { message?: string }[] } | null)?.errors;
  return Array.isArray(errors) && errors.length ? errors.map((error) => error.message ?? "error").join("; ") : null;
}

/**
 * The IDs of the public repositories in the user's GitHub list called `listName` (matched by
 * name or slug, case-insensitively). Every failure is reported, never papered over: a missing
 * token, a rejected token, an unknown list, or a GraphQL error all return `ok: false`.
 */
export async function fetchListRepositoryIds(
  username: string,
  listName: string,
  options: GitHubClientOptions = {},
): Promise<ProviderResult<number[]>> {
  if (!isValidGitHubUsername(username)) {
    return { ok: false, error: "GITHUB_USERNAME is not a valid GitHub username", transient: false };
  }
  if (!options.token) {
    return { ok: false, error: `GITHUB_TOKEN is required to read the GitHub list "${listName}" (GraphQL needs authentication)`, transient: false };
  }

  const post = (query: string, variables: Record<string, unknown>) =>
    getJson({
      url: GRAPHQL_URL,
      method: "POST",
      body: JSON.stringify({ query, variables }),
      headers: { ...headers(options.token), "Content-Type": "application/json" },
      revalidate: options.revalidate,
      tags: options.tags,
      fetchImpl: options.fetchImpl,
    });
  const failure = (error: string, transient: boolean): ProviderResult<number[]> => ({ ok: false, error: `GitHub ${error}`, transient });

  const lists = await post(listsQuery, { login: username });
  if (!lists.ok) {
    const hint = /HTTP (401|403)/.test(lists.error) && !lists.transient ? " (check GITHUB_TOKEN)" : "";
    return failure(`${lists.error}${hint}`, lists.transient);
  }
  const problem = graphqlErrors(lists.data.body);
  if (problem) return failure(`GraphQL error while reading lists: ${problem}`, false);
  const parsedLists = listsSchema.safeParse(lists.data.body);
  if (!parsedLists.success) return failure("returned an unexpected lists response", true);
  const wanted = listName.trim().toLowerCase();
  const list = parsedLists.data.data.user?.lists.nodes.find(
    (candidate) => candidate.name.toLowerCase() === wanted || candidate.slug.toLowerCase() === wanted,
  );
  if (!list) {
    return failure(`list "${listName}" was not found for ${username} (it may be private and invisible to this token, or renamed)`, false);
  }

  const ids: number[] = [];
  let after: string | null = null;
  for (let page = 0; page < MAX_LIST_PAGES; page += 1) {
    const items = await post(itemsQuery, { id: list.id, after });
    if (!items.ok) return failure(items.error, items.transient);
    const itemsProblem = graphqlErrors(items.data.body);
    if (itemsProblem) return failure(`GraphQL error while reading list items: ${itemsProblem}`, false);
    const parsed = itemsSchema.safeParse(items.data.body);
    const connection = parsed.success ? parsed.data.data.node?.items : undefined;
    if (!connection) return failure("returned an unexpected list items response", true);

    for (const node of connection.nodes) {
      // Gists and other item types can also be listed; only public repositories are projects.
      if (node?.__typename === "Repository" && node.databaseId !== undefined && !node.isPrivate) ids.push(node.databaseId);
    }
    if (!connection.pageInfo.hasNextPage) return { ok: true, data: [...new Set(ids)] };
    after = connection.pageInfo.endCursor;
  }
  return failure(`list "${listName}" has more than ${MAX_LIST_PAGES * 100} items`, false);
}
