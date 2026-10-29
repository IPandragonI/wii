import { describe, expect, it } from "vitest";

import { fetchVercelProjects, parseVercelProject, selectProduction } from "@/lib/vercel";
import { deployment, jsonResponse, routeFetch, vercelProject } from "../../test/fixtures";

describe("selectProduction", () => {
  it("uses the custom production domain of a ready production deployment", () => {
    const summary = selectProduction(
      vercelProject({
        productionDomains: ["app-octo.vercel.app", "www.example.com", "example.com"],
        deployments: [deployment({ aliases: ["app-git-main-octo.vercel.app"] })],
      }),
    );
    expect(summary.productionUrl).toBe("https://example.com/");
    expect(summary.lastDeploymentAt).toBe("2026-10-02T00:00:00.000Z");
  });

  it("falls back to the shortest vercel.app domain, never a branch alias or deployment URL", () => {
    const summary = selectProduction(
      vercelProject({
        deployments: [deployment({ aliases: ["app-git-main-octo.vercel.app", "app-octo.vercel.app", "app.vercel.app"] })],
      }),
    );
    expect(summary.productionUrl).toBe("https://app.vercel.app/");
  });

  it("ignores preview deployments even when they are newer", () => {
    const summary = selectProduction(
      vercelProject({
        productionDomains: ["app.vercel.app"],
        deployments: [
          deployment({ id: "preview", target: null, createdAt: Date.parse("2026-10-20T00:00:00Z") }),
          deployment({ id: "prod", createdAt: Date.parse("2026-10-01T00:00:00Z") }),
        ],
      }),
    );
    expect(summary.lastDeploymentAt).toBe("2026-10-01T00:00:00.000Z");
    expect(summary.productionUrl).toBe("https://app.vercel.app/");
  });

  it("keeps the last ready production deployment while a newer one is building", () => {
    const summary = selectProduction(
      vercelProject({
        productionDomains: ["app.vercel.app"],
        deployments: [
          deployment({ id: "new", readyState: "BUILDING", createdAt: Date.parse("2026-10-20T00:00:00Z") }),
          deployment({ id: "old", createdAt: Date.parse("2026-10-01T00:00:00Z") }),
        ],
      }),
    );
    expect(summary).toMatchObject({ productionUrl: "https://app.vercel.app/", latestProductionState: "BUILDING" });
  });

  it.each(["ERROR", "CANCELED", "QUEUED", "BUILDING"] as const)("offers no URL when the only production deployment is %s", (state) => {
    const summary = selectProduction(
      vercelProject({ productionDomains: ["app.vercel.app"], deployments: [deployment({ readyState: state })] }),
    );
    expect(summary.productionUrl).toBeUndefined();
    expect(summary.lastDeploymentAt).toBeUndefined();
    expect(summary.latestProductionState).toBe(state);
  });

  it("handles projects without deployments", () => {
    expect(selectProduction(vercelProject())).toEqual({ latestProductionState: undefined });
  });
});

describe("parseVercelProject", () => {
  it("extracts git link, production domains and deployments, skipping malformed records", () => {
    const project = parseVercelProject({
      id: "prj_9",
      name: "islebound",
      link: { type: "github", org: "octo", repo: "islebound", repoId: 42, deployHooks: [] },
      alias: [
        { domain: "islebound.dev", environment: "production", target: "PRODUCTION" },
        { domain: "old.islebound.dev", environment: "production", redirect: "islebound.dev" },
        { domain: "preview.islebound.dev", environment: "preview" },
      ],
      targets: {
        production: { id: "dpl_a", url: "islebound-a.vercel.app", readyState: "READY", target: "production", createdAt: 1, alias: [] },
      },
      latestDeployments: [{ id: "dpl_b", readyState: "NOT_A_STATE" }],
    });
    expect(project).toMatchObject({
      id: "prj_9",
      link: { type: "github", org: "octo", repo: "islebound", repoId: 42 },
      productionDomains: ["islebound.dev"],
    });
    expect(project?.deployments.map((d) => d.id)).toEqual(["dpl_a"]);
  });

  it("returns null for records without an id", () => {
    expect(parseVercelProject({ name: "x" })).toBeNull();
  });
});

describe("fetchVercelProjects", () => {
  it("passes the team ID and follows pagination", async () => {
    const { fetchImpl, calls } = routeFetch([
      ["from=123", () => jsonResponse({ projects: [{ id: "prj_2", name: "b" }], pagination: { next: null } })],
      ["/v10/projects", () => jsonResponse({ projects: [{ id: "prj_1", name: "a" }], pagination: { next: 123 } })],
    ]);
    const result = await fetchVercelProjects({ token: "tok", teamId: "team_1", fetchImpl });
    expect(result.ok && result.data.map((p) => p.id)).toEqual(["prj_1", "prj_2"]);
    expect(calls[0].url).toContain("teamId=team_1");
    expect(calls[0].url).not.toContain("tok");
  });

  it("reports invalid credentials as a permanent failure", async () => {
    const { fetchImpl } = routeFetch([["/v10/projects", () => jsonResponse({ error: {} }, { status: 403 })]]);
    const result = await fetchVercelProjects({ token: "tok", fetchImpl });
    expect(result).toMatchObject({ ok: false, transient: false });
    expect(!result.ok && result.error).not.toContain("tok ");
  });

  it("reports outages and invalid payloads as transient", async () => {
    const down = routeFetch([["/v10/projects", () => jsonResponse({}, { status: 503 })]]);
    expect(await fetchVercelProjects({ token: "t", fetchImpl: down.fetchImpl })).toMatchObject({ ok: false, transient: true });

    const garbage = routeFetch([["/v10/projects", () => jsonResponse({ nope: 1 })]]);
    expect(await fetchVercelProjects({ token: "t", fetchImpl: garbage.fetchImpl })).toMatchObject({ ok: false, transient: true });
  });
});
