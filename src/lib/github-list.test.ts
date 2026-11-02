import { describe, expect, it } from "vitest";

import { fetchListRepositoryIds } from "@/lib/github";
import type { FetchLike } from "@/lib/http";
import { decideVisibility } from "@/lib/project-normalizer";
import { syncPortfolio, type SyncConfig } from "@/lib/project-sync";
import { jsonResponse, rawRepository, repository, rules } from "../../test/fixtures";

const lists = (names: string[]) => ({
  data: { user: { lists: { nodes: names.map((name, i) => ({ id: `UL_${i}`, name, slug: name.toLowerCase() })) } } },
});
const items = (nodes: unknown[], next: string | null = null) => ({
  data: { node: { items: { pageInfo: { hasNextPage: next !== null, endCursor: next }, nodes } } },
});
const repo = (databaseId: number, isPrivate = false) => ({ __typename: "Repository", databaseId, isPrivate });

/** Answers GraphQL by looking at the query text, and REST by URL. */
function githubFetch(options: { lists?: () => Response; items?: (after: string | null) => Response; repos?: unknown[] }) {
  const calls: { url: string; body?: string }[] = [];
  const fetchImpl: FetchLike = async (url, init) => {
    calls.push({ url, body: init?.body as string | undefined });
    if (url.endsWith("/graphql")) {
      const { query, variables } = JSON.parse(init?.body as string);
      if (query.includes("lists(first")) return options.lists?.() ?? jsonResponse(lists(["Portfolio"]));
      return options.items?.(variables.after) ?? jsonResponse(items([]));
    }
    if (url.includes("/users/octo/repos")) return jsonResponse(options.repos ?? []);
    if (url.includes("/languages")) return jsonResponse({});
    throw new Error(`Unexpected request: ${url}`);
  };
  return { fetchImpl, calls };
}

describe("fetchListRepositoryIds", () => {
  it("returns the repositories of the named list, following pagination", async () => {
    const { fetchImpl, calls } = githubFetch({
      items: (after) => (after === null ? jsonResponse(items([repo(1), repo(2)], "c1")) : jsonResponse(items([repo(3)]))),
    });
    const result = await fetchListRepositoryIds("octo", "portfolio", { token: "t", fetchImpl });
    expect(result).toEqual({ ok: true, data: [1, 2, 3] });
    expect(calls.filter((call) => call.url.endsWith("/graphql"))).toHaveLength(3);
  });

  it("matches the list by name case-insensitively and ignores private repos and non-repository items", async () => {
    const { fetchImpl } = githubFetch({
      lists: () => jsonResponse(lists(["Reading", "Portfolio"])),
      items: () => jsonResponse(items([repo(1), repo(2, true), { __typename: "Gist" }, null])),
    });
    expect(await fetchListRepositoryIds("octo", "PORTFOLIO", { token: "t", fetchImpl })).toEqual({ ok: true, data: [1] });
  });

  it("sends the token only in the Authorization header", async () => {
    const { fetchImpl, calls } = githubFetch({});
    await fetchListRepositoryIds("octo", "Portfolio", { token: "secret-token", fetchImpl });
    expect(calls.every((call) => !call.url.includes("secret-token") && !call.body?.includes("secret-token"))).toBe(true);
  });

  it("reports a missing token instead of guessing", async () => {
    const { fetchImpl, calls } = githubFetch({});
    const result = await fetchListRepositoryIds("octo", "Portfolio", { fetchImpl });
    expect(result).toMatchObject({ ok: false, transient: false });
    expect(calls).toHaveLength(0);
  });

  it("reports an unknown list", async () => {
    const { fetchImpl } = githubFetch({ lists: () => jsonResponse(lists(["Other"])) });
    const result = await fetchListRepositoryIds("octo", "Portfolio", { token: "t", fetchImpl });
    expect(result).toMatchObject({ ok: false, transient: false });
    expect(!result.ok && result.error).toContain('"Portfolio" was not found');
  });

  it("classifies a rejected token as permanent and a server error as transient", async () => {
    const rejected = await fetchListRepositoryIds("octo", "Portfolio", {
      token: "t",
      fetchImpl: githubFetch({ lists: () => jsonResponse({}, { status: 401 }) }).fetchImpl,
    });
    expect(rejected).toMatchObject({ ok: false, transient: false });
    const down = await fetchListRepositoryIds("octo", "Portfolio", {
      token: "t",
      fetchImpl: githubFetch({ lists: () => jsonResponse({}, { status: 502 }) }).fetchImpl,
    });
    expect(down).toMatchObject({ ok: false, transient: true });
  });

  it("treats GraphQL errors delivered with HTTP 200 as failures", async () => {
    const { fetchImpl } = githubFetch({ lists: () => jsonResponse({ errors: [{ message: "Resource not accessible" }] }) });
    const result = await fetchListRepositoryIds("octo", "Portfolio", { token: "t", fetchImpl });
    expect(result).toMatchObject({ ok: false });
    expect(!result.ok && result.error).toContain("Resource not accessible");
  });
});

describe("list-driven visibility", () => {
  const inList = new Set([1]);
  it("shows exactly the list members, including forks and archived repositories", () => {
    expect(decideVisibility(repository({ id: 1, fork: true, archived: true }), undefined, rules, inList)).toBe("explicit");
    expect(decideVisibility(repository({ id: 2 }), undefined, rules, inList)).toBe("hidden");
  });

  it("still hides private repositories and explicit exclusions", () => {
    expect(decideVisibility(repository({ id: 1, isPrivate: true }), undefined, rules, inList)).toBe("hidden");
    expect(decideVisibility(repository({ id: 1 }), { repositoryId: 1, visible: false }, rules, inList)).toBe("hidden");
  });

  it("an override cannot pull a repository outside the list into the portfolio", () => {
    expect(decideVisibility(repository({ id: 2 }), { repositoryId: 2, featured: true }, rules, inList)).toBe("hidden");
  });
});

describe("syncPortfolio with a GitHub list", () => {
  const config: SyncConfig = { overrides: [], rules: { ...rules, githubList: "Portfolio" }, fallback: [] };
  const repos = [rawRepository({ id: 1, name: "alpha" }), rawRepository({ id: 2, name: "beta" }), rawRepository({ id: 3, name: "gamma" })];
  const env = { githubUsername: "octo", githubToken: "t" };

  it("shows only the repositories in the list", async () => {
    const { fetchImpl } = githubFetch({ repos, items: () => jsonResponse(items([repo(1), repo(3)])) });
    const data = await syncPortfolio(env, config, { fetchImpl });
    expect(data.projects.map((project) => project.slug).sort()).toEqual(["alpha", "gamma"]);
    expect(data.listUnavailable).toBe(false);
  });

  it("shows an empty list as empty, not as every repository", async () => {
    const { fetchImpl } = githubFetch({ repos, items: () => jsonResponse(items([])) });
    const data = await syncPortfolio(env, config, { fetchImpl });
    expect(data.projects).toEqual([]);
    expect(data.listUnavailable).toBe(false);
  });

  it("never falls back to every repository when the list cannot be read", async () => {
    const { fetchImpl } = githubFetch({ repos, lists: () => jsonResponse({}, { status: 403 }) });
    const data = await syncPortfolio(env, config, { fetchImpl });
    expect(data.source).toBe("live");
    expect(data.projects).toEqual([]);
    expect(data.listUnavailable).toBe(true);
    expect(data.issues).toContainEqual(expect.objectContaining({ provider: "github" }));
  });

  it("reports a missing token and still shows no repositories", async () => {
    const { fetchImpl } = githubFetch({ repos });
    const data = await syncPortfolio({ githubUsername: "octo" }, config, { fetchImpl });
    expect(data.projects).toEqual([]);
    expect(data.listUnavailable).toBe(true);
  });

  it("flags a transient list failure so a good cached portfolio is kept", async () => {
    const { fetchImpl } = githubFetch({ repos, lists: () => jsonResponse({}, { status: 502 }) });
    const data = await syncPortfolio(env, config, { fetchImpl });
    expect(data.issues.some((issue) => issue.transient)).toBe(true);
  });
});
