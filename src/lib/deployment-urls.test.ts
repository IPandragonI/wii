import { describe, expect, it, vi } from "vitest";

import { buildMenuChannels } from "@/lib/menu";
import { buildPortfolio, indexOverrides, matchVercelProjects, trustedHomepage } from "@/lib/project-normalizer";
import { parseProductionDomains, selectProduction, withProductionDomains } from "@/lib/vercel";
import { deployment, jsonResponse, repository, rules, vercelProject } from "../../test/fixtures";

describe("trustedHomepage", () => {
  it("never trusts a *.vercel.app homepage, which goes stale when Vercel renames domains", () => {
    expect(trustedHomepage("https://cherry-mu-ten.vercel.app")).toBeUndefined();
    expect(trustedHomepage("http://wii-beta.vercel.app/")).toBeUndefined();
  });

  it("keeps an owner-declared homepage on another host, upgraded to https", () => {
    expect(trustedHomepage("https://ipandragoni.github.io/portfolio/")).toBe("https://ipandragoni.github.io/portfolio/");
    expect(trustedHomepage("http://kart.example.com")).toBe("https://kart.example.com/");
  });

  it("rejects empty and non-http values", () => {
    expect(trustedHomepage(null)).toBeUndefined();
    expect(trustedHomepage("")).toBeUndefined();
    expect(trustedHomepage("javascript:alert(1)")).toBeUndefined();
  });
});

describe("production URL resolution", () => {
  const cherry = repository({ id: 7, name: "Cherry", homepage: "https://cherry-mu-ten.vercel.app" });
  const live = vercelProject({
    id: "prj_cherry",
    name: "cherry",
    link: { type: "github", org: "octo", repo: "Cherry", repoId: 7 },
    productionDomains: ["cherry-tuner.vercel.app"],
    deployments: [deployment({ aliases: ["cherry-pandragon-projects.vercel.app", "cherry-git-master-team.vercel.app"] })],
  });

  it("uses the Vercel production domain, not the stale GitHub homepage", () => {
    const { projects } = buildPortfolio({ repositories: [cherry], vercelProjects: [live], overrides: [], rules });
    expect(projects[0].productionUrl).toBe("https://cherry-tuner.vercel.app/");
  });

  it("leaves the URL empty, rather than using the stale homepage, when Vercel cannot be reached", () => {
    const { projects } = buildPortfolio({ repositories: [cherry], vercelProjects: null, overrides: [], rules });
    expect(projects[0].productionUrl).toBeUndefined();
  });

  it("prefers the project's own production domains over deployment aliases", () => {
    expect(selectProduction(live).productionUrl).toBe("https://cherry-tuner.vercel.app/");
  });

  it("never gives a project another project's URL: a pinned ID linked to a different repository is refused", () => {
    const other = vercelProject({
      id: "prj_other",
      name: "other",
      link: { type: "github", org: "octo", repo: "Different", repoId: 99 },
      productionDomains: ["other.vercel.app"],
      deployments: [deployment()],
    });
    const overrides = [{ repositoryId: 7, vercelProjectId: "prj_other" }];
    const { index } = indexOverrides(overrides);
    const { matches, issues } = matchVercelProjects([cherry], [other], index);
    expect(matches.size).toBe(0);
    expect(issues[0].message).toContain("linked to octo/Different");

    const { projects } = buildPortfolio({ repositories: [cherry], vercelProjects: [other], overrides, rules });
    expect(projects[0].productionUrl).toBeUndefined();
  });

  it("matches by pinned project ID even when names differ", () => {
    const renamed = vercelProject({ ...live, name: "totally-different-name", link: null });
    const overrides = [{ repositoryId: 7, vercelProjectId: "prj_cherry" }];
    const { projects } = buildPortfolio({ repositories: [cherry], vercelProjects: [renamed], overrides, rules });
    expect(projects[0].productionUrl).toBe("https://cherry-tuner.vercel.app/");
  });
});

describe("production domains from Vercel", () => {
  it("keeps verified, branch-less, non-redirect domains", () => {
    expect(
      parseProductionDomains({
        domains: [
          { name: "Karting-Zeta.vercel.app", gitBranch: null, redirect: null, verified: true },
          { name: "preview.example.com", gitBranch: "dev", verified: true },
          { name: "old.example.com", redirect: "karting.example.com", verified: true },
          { name: "pending.example.com", verified: false },
        ],
      }),
    ).toEqual(["karting-zeta.vercel.app"]);
  });

  it("returns null for an unexpected payload", () => {
    expect(parseProductionDomains({ nope: true })).toBeNull();
  });

  it("looks the domains up per project and tolerates a failed lookup", async () => {
    const calls: string[] = [];
    const fetchImpl = vi.fn(async (url: string) => {
      calls.push(url);
      if (url.includes("prj_ok")) return jsonResponse({ domains: [{ name: "ok.example.com", verified: true }] });
      return jsonResponse({ error: "nope" }, { status: 500 });
    });
    const projects = [
      vercelProject({ id: "prj_ok", name: "ok", deployments: [deployment()] }),
      vercelProject({ id: "prj_bad", name: "bad", deployments: [deployment()] }),
      vercelProject({ id: "prj_none", name: "none" }),
    ];
    const result = await withProductionDomains(projects, { token: "t", teamId: "team_1", fetchImpl });
    expect(result.map((project) => project.productionDomains)).toEqual([["ok.example.com"], [], []]);
    expect(calls).toHaveLength(2);
    expect(calls[0]).toContain("/v9/projects/prj_ok/domains");
    expect(calls[0]).toContain("teamId=team_1");
  });
});

describe("external profile channels", () => {
  it("opens LinkedIn and GitHub directly via a validated https launch URL", () => {
    const channels = Object.fromEntries(buildMenuChannels([]).map((channel) => [channel.banner, channel]));
    expect(channels.linkedin.launchUrl).toBe("https://www.linkedin.com/in/mathys-farineau/");
    expect(channels.github.launchUrl).toBe("https://github.com/IPandragonI");
  });

  it("leaves unrelated system channels on their internal pages", () => {
    const channels = Object.fromEntries(buildMenuChannels([]).map((channel) => [channel.banner, channel]));
    for (const id of ["projects", "about", "contact"]) expect(channels[id].launchUrl).toBeUndefined();
  });
});
