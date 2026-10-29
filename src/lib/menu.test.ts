import { describe, expect, it } from "vitest";

import { buildMenuChannels, launchUrlFor, projectChannel, tintFor } from "@/lib/menu";
import { buildFallbackPortfolio } from "@/lib/project-normalizer";

const featured = buildFallbackPortfolio([
  { key: "a", name: "Alpha", slug: "alpha", description: "", category: "Game", technologies: [], order: 1 },
  { key: "b", name: "Beta", slug: "beta", description: "", category: "Web app", technologies: [], order: 2 },
]);

describe("buildMenuChannels", () => {
  it("expands the layout: featured projects, then the built-in channels", () => {
    expect(buildMenuChannels(featured).map((channel) => channel.href)).toEqual([
      "/projects/alpha",
      "/projects/beta",
      "/projects",
      "/github",
      "/about",
      "/linkedin",
      "/contact",
    ]);
  });

  it("gives every built-in channel its own scene", () => {
    const scenes = buildMenuChannels([]).map((channel) => channel.banner);
    expect(scenes).toEqual(["projects", "github", "about", "linkedin", "contact"]);
  });
});

describe("projectChannel", () => {
  it("links to the stable slug route and keeps a deterministic tint", () => {
    const channel = projectChannel(featured[0]);
    expect(channel).toMatchObject({ key: "local-a", href: "/projects/alpha", title: "Alpha", subtitle: "Game" });
    expect(tintFor("alpha")).toBe(tintFor("alpha"));
  });

  it("only launches projects with an https deployment", () => {
    expect(projectChannel(featured[0]).launchUrl).toBeUndefined();
    expect(projectChannel({ ...featured[0], productionUrl: "https://alpha.example.com/" }).launchUrl).toBe("https://alpha.example.com/");
  });
});

describe("launchUrlFor", () => {
  it("accepts https URLs and rejects everything else", () => {
    expect(launchUrlFor("https://app.vercel.app")).toBe("https://app.vercel.app/");
    expect(launchUrlFor("http://insecure.example")).toBeUndefined();
    expect(launchUrlFor("javascript:alert(1)")).toBeUndefined();
    expect(launchUrlFor("not a url")).toBeUndefined();
    expect(launchUrlFor(undefined)).toBeUndefined();
  });
});
