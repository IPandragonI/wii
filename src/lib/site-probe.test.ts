import { describe, expect, it } from "vitest";

import { bannerFromText, inferBanner } from "@/lib/project-normalizer";
import { enrichWithSiteInfo } from "@/lib/project-sync";
import { parseSiteMetadata, probeSite } from "@/lib/site-probe";
import type { PortfolioProject } from "@/types/project";
import { routeFetch } from "../../test/fixtures";

describe("parseSiteMetadata", () => {
  const html = `<!doctype html><html><head>
    <title>Outpost — analyse d&#x27;échecs</title>
    <meta name="description" content="Analyse de parties d&#x27;échecs : évaluations Stockfish.">
    <meta property="og:image" content="/og.png">
    <meta name="theme-color" content="#1A7F37">
    <meta name="theme-color" content="red">
  </head><body><meta property="og:image" content="/ignored.png"></body></html>`;

  it("reads the title, description, og:image, and theme-color", () => {
    expect(parseSiteMetadata(html, "https://app.example.com/start")).toEqual({
      text: "Outpost — analyse d'échecs Analyse de parties d'échecs : évaluations Stockfish.",
      image: "https://app.example.com/og.png",
      color: "#1a7f37",
    });
  });

  it("ignores theme colors too light or too dark to use as an accent", () => {
    const meta = (color: string) => `<head><meta name="theme-color" content="${color}"></head>`;
    expect(parseSiteMetadata(meta("#ffffff"), "https://a.example/").color).toBeUndefined();
    expect(parseSiteMetadata(meta("#000"), "https://a.example/").color).toBeUndefined();
    expect(parseSiteMetadata(meta("#C0392B"), "https://a.example/").color).toBe("#c0392b");
  });

  it("drops unsafe or non-https values", () => {
    const unsafe = `<head><meta property="og:image" content="javascript:alert(1)"><meta name="theme-color" content="url(x)"></head>`;
    expect(parseSiteMetadata(unsafe, "https://app.example.com/")).toEqual({ text: undefined, image: undefined, color: undefined });
  });
});

describe("probeSite", () => {
  it("returns the page metadata", async () => {
    const { fetchImpl } = routeFetch([
      ["app.example.com", () => new Response("<head><title>Darts</title></head>", { headers: { "content-type": "text/html" } })],
    ]);
    expect(await probeSite("https://app.example.com/", { fetchImpl })).toEqual({ text: "Darts", image: undefined, color: undefined });
  });

  it("returns null when the site cannot be reached or is not HTML", async () => {
    const offline = routeFetch([["app.example.com", () => Promise.reject(new TypeError("offline"))]]);
    expect(await probeSite("https://app.example.com/", { fetchImpl: offline.fetchImpl })).toBeNull();
    const json = routeFetch([["app.example.com", () => new Response("{}", { headers: { "content-type": "application/json" } })]]);
    expect(await probeSite("https://app.example.com/", { fetchImpl: json.fetchImpl })).toBeNull();
  });
});

describe("enrichWithSiteInfo", () => {
  const project = (id: string, url: string | undefined, banner: PortfolioProject["banner"], fallback: boolean): PortfolioProject => ({
    id,
    slug: id,
    name: id,
    description: "",
    category: "Project",
    technologies: [],
    highlights: [],
    featured: false,
    order: 1,
    status: "production",
    banner,
    bannerFallback: fallback || undefined,
    source: "live",
    productionUrl: url,
  });
  const site = (title: string) => () => new Response(`<head><title>${title}</title></head>`, { headers: { "content-type": "text/html" } });

  it("refines default banners from the site's own text, but never explicit ones", async () => {
    const { fetchImpl } = routeFetch([
      ["quiz.example", site("Calandre — Le quiz auto : trouvez la voiture")],
      ["tuner.example", site("Accordeur de guitare")],
      ["chosen.example", site("Marqueur de fléchettes")],
    ]);
    const [quiz, tuner, chosen, offline] = await enrichWithSiteInfo(
      [
        project("a", "https://quiz.example/", "app", true),
        project("b", "https://tuner.example/", "app", true),
        project("c", "https://chosen.example/", "island", false),
        project("d", undefined, "app", true),
      ],
      { fetchImpl },
    );
    expect(quiz.banner).toBe("road");
    expect(tuner.banner).toBe("music");
    expect(chosen.banner).toBe("island");
    expect(offline.banner).toBe("app");
    expect([quiz, tuner, chosen, offline].every((p) => !("bannerFallback" in p))).toBe(true);
  });
});

describe("banner inference", () => {
  it("prefers the override, then the icon, then topics, then text, then the category", () => {
    expect(inferBanner({ banner: "island", icon: "chess", category: "Game" })).toBe("island");
    expect(inferBanner({ icon: "chess", category: "Web app" })).toBe("board");
    expect(inferBanner({ topics: ["React", "Racing"], category: "Game" })).toBe("race");
    expect(inferBanner({ text: "outpost outpost-chess-analysis.vercel.app", category: "Project" })).toBe("board");
    expect(inferBanner({ category: "Game" })).toBe("arcade");
    expect(inferBanner({ category: "Web app" })).toBe("app");
  });

  it("recognizes themes in English and French", () => {
    expect(bannerFromText("Accordeur de guitare, bibliothèque d'accords")).toBe("music");
    expect(bannerFromText("Marqueur 501/301 de fléchettes")).toBe("darts");
    expect(bannerFromText("Neural Network for autonomous vehicles")).toBe("network");
    expect(bannerFromText("Une photo, une voiture : trouvez la marque")).toBe("road");
    expect(bannerFromText("A small browser karting game with drifting")).toBe("race");
    expect(bannerFromText("J'ai créé une cartographie")).toBeUndefined();
  });
});
