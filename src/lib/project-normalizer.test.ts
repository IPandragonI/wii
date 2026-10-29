import { describe, expect, it } from "vitest";

import {
  assignUniqueSlugs,
  buildFallbackPortfolio,
  buildPortfolio,
  decideVisibility,
  indexOverrides,
  matchVercelProjects,
} from "@/lib/project-normalizer";
import type { ProjectOverride } from "@/types/config";
import { deployment, repository, rules, vercelProject } from "../../test/fixtures";

const noOverrides = indexOverrides([]).index;

describe("decideVisibility", () => {
  it("excludes forks and archived repositories by default", () => {
    expect(decideVisibility(repository({ fork: true }), undefined, rules)).toBe("hidden");
    expect(decideVisibility(repository({ archived: true }), undefined, rules)).toBe("hidden");
    expect(decideVisibility(repository(), undefined, rules)).toBe("discovered");
  });

  it("includes forks and archived repositories when enabled", () => {
    const open = { ...rules, includeForks: true, includeArchived: true };
    expect(decideVisibility(repository({ fork: true }), undefined, open)).toBe("discovered");
    expect(decideVisibility(repository({ archived: true }), undefined, open)).toBe("discovered");
  });

  it("always hides hidden repositories, even when featured", () => {
    expect(decideVisibility(repository(), { repositoryId: 1, visible: false, featured: true }, rules)).toBe("hidden");
    expect(decideVisibility(repository({ name: "Dotfiles" }), undefined, { ...rules, hiddenRepositories: ["dotfiles"] })).toBe(
      "hidden",
    );
  });

  it("shows featured repositories even if archived", () => {
    expect(decideVisibility(repository({ archived: true }), { repositoryId: 1, featured: true }, rules)).toBe("explicit");
  });

  it("never shows private repositories", () => {
    expect(decideVisibility(repository({ isPrivate: true }), { repositoryId: 1, featured: true }, rules)).toBe("hidden");
  });

  it("only shows curated repositories when auto discovery is off", () => {
    const curatedOnly = { ...rules, autoDiscover: false };
    expect(decideVisibility(repository(), undefined, curatedOnly)).toBe("hidden");
    expect(decideVisibility(repository(), { repositoryId: 1 }, curatedOnly)).toBe("explicit");
  });
});

describe("matchVercelProjects", () => {
  const repo = repository({ id: 42, name: "islebound" });

  it("prefers the Git link over a name match", () => {
    const linked = vercelProject({ id: "prj_link", name: "game", link: { type: "github", repoId: 42 } });
    const named = vercelProject({ id: "prj_name", name: "islebound" });
    expect(matchVercelProjects([repo], [named, linked], noOverrides).matches.get(42)?.id).toBe("prj_link");
  });

  it("matches by owner and repository name when the link has no repoId", () => {
    const linked = vercelProject({ id: "prj_link", link: { type: "github", org: "OCTO", repo: "Islebound" } });
    expect(matchVercelProjects([repo], [linked], noOverrides).matches.get(42)?.id).toBe("prj_link");
  });

  it("falls back to an exact name match only for unlinked projects", () => {
    const unlinked = vercelProject({ id: "prj_a", name: "Islebound" });
    expect(matchVercelProjects([repo], [unlinked], noOverrides).matches.get(42)?.id).toBe("prj_a");

    const linkedElsewhere = vercelProject({ id: "prj_b", name: "islebound", link: { type: "github", repoId: 999 } });
    expect(matchVercelProjects([repo], [linkedElsewhere], noOverrides).matches.has(42)).toBe(false);
  });

  it("leaves ambiguous matches unresolved and reports them", () => {
    const a = vercelProject({ id: "prj_a", name: "islebound-web", link: { type: "github", repoId: 42 } });
    const b = vercelProject({ id: "prj_b", name: "islebound-docs", link: { type: "github", repoId: 42 } });
    const result = matchVercelProjects([repo], [a, b], noOverrides);
    expect(result.matches.has(42)).toBe(false);
    expect(result.issues[0].message).toMatch(/matches 2 Vercel projects/);
  });

  it("lets a manual vercelProjectId win and resolve ambiguity", () => {
    const a = vercelProject({ id: "prj_a", link: { type: "github", repoId: 42 } });
    const b = vercelProject({ id: "prj_b", link: { type: "github", repoId: 42 } });
    const { index } = indexOverrides([{ repositoryId: 42, vercelProjectId: "prj_b" }]);
    expect(matchVercelProjects([repo], [a, b], index).matches.get(42)?.id).toBe("prj_b");
  });

  it("does not guess when the configured project is missing", () => {
    const linked = vercelProject({ id: "prj_a", link: { type: "github", repoId: 42 } });
    const { index } = indexOverrides([{ repositoryId: 42, vercelProjectId: "prj_gone" }]);
    const result = matchVercelProjects([repo], [linked], index);
    expect(result.matches.has(42)).toBe(false);
    expect(result.issues[0].message).toMatch(/prj_gone/);
  });

  it("does not auto-match a project already claimed by another repository's override", () => {
    const other = repository({ id: 7, name: "islebound-v2" });
    const project = vercelProject({ id: "prj_a", name: "islebound" });
    const { index } = indexOverrides([{ repositoryId: 7, vercelProjectId: "prj_a" }]);
    const result = matchVercelProjects([repo, other], [project], index);
    expect(result.matches.get(7)?.id).toBe("prj_a");
    expect(result.matches.has(42)).toBe(false);
  });
});

describe("buildPortfolio", () => {
  const repos = [
    repository({ id: 1, name: "kart-racing", pushedAt: "2026-01-01T00:00:00Z", description: "From GitHub" }),
    repository({ id: 2, name: "islebound", pushedAt: "2026-09-01T00:00:00Z", homepage: "https://islebound.example" }),
    repository({ id: 3, name: "old-thing", archived: true, pushedAt: "2024-01-01T00:00:00Z" }),
    repository({ id: 4, name: "forked", fork: true }),
    repository({ id: 5, name: "newest", pushedAt: "2026-10-20T00:00:00Z", description: null }),
  ];

  it("applies override precedence: override, then GitHub, then defaults", () => {
    const overrides: ProjectOverride[] = [
      { repositoryName: "kart-racing", title: "Kart Racing DX", description: "Custom copy", category: "Game", slug: "karts" },
    ];
    const { projects } = buildPortfolio({ repositories: repos, vercelProjects: null, overrides, rules });
    const kart = projects.find((project) => project.id === "gh-1");
    expect(kart).toMatchObject({ name: "Kart Racing DX", description: "Custom copy", category: "Game", slug: "karts" });

    const newest = projects.find((project) => project.id === "gh-5");
    expect(newest).toMatchObject({ name: "Newest", description: "", category: "Project", slug: "newest", featured: false });
  });

  it("puts featured projects in configured order and keeps them even when old", () => {
    const overrides: ProjectOverride[] = [
      { repositoryName: "kart-racing", featured: true, order: 1 },
      { repositoryId: 3, featured: true, order: 2 },
    ];
    const { projects, recent } = buildPortfolio({
      repositories: repos,
      vercelProjects: null,
      overrides,
      rules: { ...rules, recentLimit: 2 },
    });
    expect(projects.slice(0, 2).map((project) => project.id)).toEqual(["gh-1", "gh-3"]);
    expect(projects.find((project) => project.id === "gh-3")?.status).toBe("archived");
    expect(projects.some((project) => project.id === "gh-4")).toBe(false);
    expect(recent.map((project) => project.id)).toEqual(["gh-5", "gh-2"]);
  });

  it("sorts unordered projects by most recent update", () => {
    const { projects } = buildPortfolio({ repositories: repos, vercelProjects: null, overrides: [], rules });
    expect(projects.map((project) => project.id)).toEqual(["gh-5", "gh-2", "gh-1"]);
  });

  it("uses Vercel production data and falls back to the GitHub homepage", () => {
    const vercel = [
      vercelProject({
        id: "prj_k",
        link: { type: "github", repoId: 1 },
        productionDomains: ["kart.example.com"],
        deployments: [deployment()],
      }),
    ];
    const { projects } = buildPortfolio({ repositories: repos, vercelProjects: vercel, overrides: [], rules });
    expect(projects.find((project) => project.id === "gh-1")).toMatchObject({
      productionUrl: "https://kart.example.com/",
      status: "production",
      lastDeploymentAt: "2026-10-02T00:00:00.000Z",
    });
    expect(projects.find((project) => project.id === "gh-2")?.productionUrl).toBe("https://islebound.example/");
    expect(projects.find((project) => project.id === "gh-5")).toMatchObject({ status: "development" });
    expect(projects.find((project) => project.id === "gh-5")?.productionUrl).toBeUndefined();
  });

  it("prefers a manual production URL and rejects unsafe ones", () => {
    const { projects } = buildPortfolio({
      repositories: [repository({ id: 1, homepage: "javascript:alert(1)" }), repository({ id: 2 })],
      vercelProjects: null,
      overrides: [{ repositoryId: 2, productionUrl: "https://manual.example" }],
      rules,
    });
    expect(projects.find((project) => project.id === "gh-1")?.productionUrl).toBeUndefined();
    expect(projects.find((project) => project.id === "gh-2")?.productionUrl).toBe("https://manual.example/");
  });

  it("reports overrides that reference missing repositories without creating projects", () => {
    const { projects, issues } = buildPortfolio({
      repositories: [repository({ id: 1 })],
      vercelProjects: null,
      overrides: [{ repositoryName: "does-not-exist", featured: true }],
      rules,
    });
    expect(projects).toHaveLength(1);
    expect(issues.some((issue) => issue.message.includes("does-not-exist"))).toBe(true);
  });

  it("deduplicates repositories and produces stable, unique slugs", () => {
    const { projects } = buildPortfolio({
      repositories: [repository({ id: 1, name: "App" }), repository({ id: 1, name: "App" }), repository({ id: 2, name: "app" })],
      vercelProjects: null,
      overrides: [],
      rules,
    });
    expect(projects.map((project) => project.slug).sort()).toEqual(["app", "app-2"]);
  });

  it("omits missing optional metadata rather than inventing it", () => {
    const { projects } = buildPortfolio({
      repositories: [repository({ id: 1, language: null, pushedAt: null, description: null })],
      vercelProjects: null,
      overrides: [],
      rules,
    });
    expect(projects[0].technologies).toEqual([]);
    expect(projects[0].lastUpdatedAt).toBe("2026-10-01T00:00:00Z");
    expect(projects[0].lastDeploymentAt).toBeUndefined();
    expect(projects[0].description).toBe("");
  });
});

describe("assignUniqueSlugs", () => {
  it("keeps the first slug and suffixes later duplicates", () => {
    const base = buildFallbackPortfolio([
      { key: "a", name: "A", slug: "same", description: "", category: "x", technologies: [], order: 1 },
      { key: "b", name: "B", slug: "same", description: "", category: "x", technologies: [], order: 2 },
    ]);
    expect(base.map((project) => project.slug)).toEqual(["same", "same-2"]);
    expect(assignUniqueSlugs(base).projects.map((project) => project.slug)).toEqual(["same", "same-2"]);
  });
});

describe("buildFallbackPortfolio", () => {
  it("marks entries as fallback and invents no links or metrics", () => {
    const [project] = buildFallbackPortfolio([
      { key: "demo", name: "Demo", slug: "demo", description: "d", category: "Game", technologies: [], order: 1 },
    ]);
    expect(project).toMatchObject({ id: "local-demo", source: "fallback", status: "development" });
    expect(project.githubUrl).toBeUndefined();
    expect(project.productionUrl).toBeUndefined();
    expect(project.githubStars).toBeUndefined();
  });
});
