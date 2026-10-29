import { describe, expect, it } from "vitest";

import { shouldPreserveStale, syncPortfolio, type SyncConfig } from "@/lib/project-sync";
import type { PortfolioData } from "@/types/project";
import { jsonResponse, rawRepository, routeFetch, rules } from "../../test/fixtures";

const config: SyncConfig = {
  overrides: [{ repositoryName: "islebound", featured: true, order: 1 }],
  rules,
  fallback: [{ key: "sample", name: "Sample", slug: "sample", description: "", category: "Game", technologies: [], order: 1 }],
};

const now = () => new Date("2026-10-29T12:00:00Z");

describe("syncPortfolio", () => {
  it("uses fallback data when no GitHub username is configured", async () => {
    const { fetchImpl, calls } = routeFetch([]);
    const data = await syncPortfolio({}, config, { fetchImpl, now });
    expect(data.source).toBe("fallback");
    expect(data.projects.map((project) => project.slug)).toEqual(["sample"]);
    expect(calls).toHaveLength(0);
  });

  it("combines GitHub and Vercel data", async () => {
    const { fetchImpl, calls } = routeFetch([
      ["/languages", () => jsonResponse({ TypeScript: 100, GLSL: 10 })],
      ["/users/octo/repos", () => jsonResponse([rawRepository({ id: 42, name: "islebound" }), rawRepository({ id: 2 })])],
      [
        "api.vercel.com/v10/projects",
        () =>
          jsonResponse({
            projects: [
              {
                id: "prj_1",
                name: "islebound",
                link: { type: "github", repoId: 42 },
                alias: [{ domain: "islebound.app", environment: "production" }],
                targets: {
                  production: { id: "d", url: "x.vercel.app", readyState: "READY", target: "production", createdAt: 0 },
                },
              },
            ],
            pagination: { next: null },
          }),
      ],
    ]);

    const data = await syncPortfolio({ githubUsername: "octo", vercelToken: "tok" }, config, { fetchImpl, now });
    expect(data.source).toBe("live");
    expect(data.lastSyncedAt).toBe("2026-10-29T12:00:00.000Z");
    expect(data.projects[0]).toMatchObject({
      slug: "islebound",
      featured: true,
      productionUrl: "https://islebound.app/",
      technologies: ["TypeScript", "GLSL"],
    });
    // Languages are only requested for curated repositories.
    expect(calls.filter((call) => call.url.includes("/languages"))).toHaveLength(1);
  });

  it("keeps GitHub data when Vercel fails", async () => {
    const { fetchImpl } = routeFetch([
      ["/languages", () => jsonResponse({})],
      ["/users/octo/repos", () => jsonResponse([rawRepository({ id: 42, name: "islebound" })])],
      ["api.vercel.com", () => jsonResponse({}, { status: 500 })],
    ]);
    const data = await syncPortfolio({ githubUsername: "octo", vercelToken: "tok" }, config, { fetchImpl, now });
    expect(data.source).toBe("live");
    expect(data.projects).toHaveLength(1);
    expect(data.issues).toContainEqual(expect.objectContaining({ provider: "vercel", transient: true }));
  });

  it("does not call Vercel without a token", async () => {
    const { fetchImpl, calls } = routeFetch([
      ["/languages", () => jsonResponse({})],
      ["/users/octo/repos", () => jsonResponse([])],
    ]);
    const data = await syncPortfolio({ githubUsername: "octo" }, config, { fetchImpl, now });
    expect(data.vercelEnabled).toBe(false);
    expect(calls.some((call) => call.url.includes("vercel"))).toBe(false);
  });

  it("retries without the token when GitHub rejects it", async () => {
    const { fetchImpl, calls } = routeFetch([
      ["/languages", () => jsonResponse({})],
      [
        "/users/octo/repos",
        () => {
          const authorized = calls.at(-1)?.init?.headers as Record<string, string> | undefined;
          return authorized?.Authorization ? jsonResponse({}, { status: 401 }) : jsonResponse([rawRepository({ id: 1 })]);
        },
      ],
    ]);
    const data = await syncPortfolio({ githubUsername: "octo", githubToken: "bad" }, config, { fetchImpl, now });
    expect(data.source).toBe("live");
    expect(data.projects).toHaveLength(1);
    expect(data.issues).toContainEqual(expect.objectContaining({ message: expect.stringMatching(/rejected/) }));
  });

  it("falls back and flags the failure when GitHub is down", async () => {
    const { fetchImpl } = routeFetch([["/users/octo/repos", () => jsonResponse({}, { status: 503 })]]);
    const data = await syncPortfolio({ githubUsername: "octo" }, config, { fetchImpl, now });
    expect(data.source).toBe("fallback");
    expect(data.issues).toContainEqual(expect.objectContaining({ provider: "github", transient: true }));
  });
});

describe("shouldPreserveStale", () => {
  const data = (transient: boolean): PortfolioData => ({
    projects: [],
    recent: [],
    source: "fallback",
    lastSyncedAt: "",
    vercelEnabled: false,
    issues: [{ provider: "github", message: "x", transient }],
  });

  it("keeps the previous cache only for transient failures at runtime", () => {
    const runtime = { NODE_ENV: "production" } as NodeJS.ProcessEnv;
    const build = { NODE_ENV: "production", NEXT_PHASE: "phase-production-build" } as NodeJS.ProcessEnv;
    const dev = { NODE_ENV: "development" } as NodeJS.ProcessEnv;

    expect(shouldPreserveStale(data(true), runtime)).toBe(true);
    expect(shouldPreserveStale(data(false), runtime)).toBe(false);
    expect(shouldPreserveStale(data(true), build)).toBe(false);
    expect(shouldPreserveStale(data(true), dev)).toBe(false);
  });
});
