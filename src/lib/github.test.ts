import { describe, expect, it } from "vitest";

import { fetchPublicRepositories, fetchRepositoryLanguages, nextPageUrl, parseRepositoryPage } from "@/lib/github";
import { jsonResponse, rawRepository, routeFetch } from "../../test/fixtures";

describe("nextPageUrl", () => {
  it("returns the rel=next link", () => {
    const header =
      '<https://api.github.com/user/1/repos?page=2>; rel="next", <https://api.github.com/user/1/repos?page=5>; rel="last"';
    expect(nextPageUrl(header)).toBe("https://api.github.com/user/1/repos?page=2");
  });

  it("returns null on the last page or for foreign hosts", () => {
    expect(nextPageUrl('<https://api.github.com/x?page=1>; rel="prev"')).toBeNull();
    expect(nextPageUrl('<https://evil.example/x?page=2>; rel="next"')).toBeNull();
    expect(nextPageUrl(null)).toBeNull();
  });
});

describe("parseRepositoryPage", () => {
  it("normalizes repositories and treats a missing description as null", () => {
    const page = parseRepositoryPage([rawRepository({ id: 7, name: "islebound", description: "  ", topics: undefined })]);
    expect(page?.repositories[0]).toMatchObject({
      id: 7,
      name: "islebound",
      owner: "octo",
      description: null,
      topics: [],
      stars: 3,
      forks: 1,
      language: "TypeScript",
    });
  });

  it("drops malformed and private entries without failing the page", () => {
    const page = parseRepositoryPage([rawRepository({ id: 1 }), { id: "nope" }, rawRepository({ id: 2, private: true })]);
    expect(page?.repositories.map((repo) => repo.id)).toEqual([1]);
    expect(page?.dropped).toBe(2);
  });

  it("rejects non-array bodies", () => {
    expect(parseRepositoryPage({ message: "Not Found" })).toBeNull();
  });
});

describe("fetchPublicRepositories", () => {
  it("follows pagination until there is no next page", async () => {
    const { fetchImpl, calls } = routeFetch([
      ["page=2", () => jsonResponse([rawRepository({ id: 3 })])],
      [
        "/users/octo/repos",
        () =>
          jsonResponse([rawRepository({ id: 1 }), rawRepository({ id: 2 })], {
            headers: { link: '<https://api.github.com/users/octo/repos?per_page=100&page=2>; rel="next"' },
          }),
      ],
    ]);

    const result = await fetchPublicRepositories("octo", { fetchImpl });
    expect(result.ok && result.data.map((repo) => repo.id)).toEqual([1, 2, 3]);
    expect(calls).toHaveLength(2);
  });

  it("sends the token only as an Authorization header", async () => {
    const { fetchImpl, calls } = routeFetch([["/users/octo/repos", () => jsonResponse([])]]);
    await fetchPublicRepositories("octo", { fetchImpl, token: "secret-token" });
    expect(calls[0].url).not.toContain("secret-token");
    expect((calls[0].init?.headers as Record<string, string>).Authorization).toBe("Bearer secret-token");
  });

  it("classifies rate limits as transient and does not leak the token", async () => {
    const { fetchImpl } = routeFetch([
      [
        "/users/octo/repos",
        () => jsonResponse({ message: "rate limited" }, { status: 403, headers: { "x-ratelimit-remaining": "0" } }),
      ],
    ]);
    const result = await fetchPublicRepositories("octo", { fetchImpl, token: "secret-token" });
    expect(result).toMatchObject({ ok: false, transient: true });
    expect(!result.ok && result.error).not.toContain("secret-token");
  });

  it("classifies an unknown user as permanent", async () => {
    const { fetchImpl } = routeFetch([["/users/octo/repos", () => jsonResponse({}, { status: 404 })]]);
    expect(await fetchPublicRepositories("octo", { fetchImpl })).toMatchObject({ ok: false, transient: false });
  });

  it("classifies network failures and server errors as transient", async () => {
    const offline = routeFetch([["/users/octo/repos", () => Promise.reject(new TypeError("fetch failed"))]]);
    expect(await fetchPublicRepositories("octo", { fetchImpl: offline.fetchImpl })).toMatchObject({
      ok: false,
      transient: true,
    });

    const down = routeFetch([["/users/octo/repos", () => jsonResponse({}, { status: 502 })]]);
    expect(await fetchPublicRepositories("octo", { fetchImpl: down.fetchImpl })).toMatchObject({
      ok: false,
      transient: true,
    });
  });

  it("treats an unexpected body as an invalid response", async () => {
    const { fetchImpl } = routeFetch([["/users/octo/repos", () => jsonResponse({ unexpected: true })]]);
    expect(await fetchPublicRepositories("octo", { fetchImpl })).toMatchObject({ ok: false });
  });

  it("rejects invalid usernames without making a request", async () => {
    const { fetchImpl, calls } = routeFetch([]);
    expect(await fetchPublicRepositories("../admin", { fetchImpl })).toMatchObject({ ok: false, transient: false });
    expect(calls).toHaveLength(0);
  });
});

describe("fetchRepositoryLanguages", () => {
  it("orders languages by size", async () => {
    const { fetchImpl } = routeFetch([["/languages", () => jsonResponse({ CSS: 10, TypeScript: 900, HTML: 50 })]]);
    expect(await fetchRepositoryLanguages("octo", "app", { fetchImpl })).toEqual({
      ok: true,
      data: ["TypeScript", "HTML", "CSS"],
    });
  });
});
