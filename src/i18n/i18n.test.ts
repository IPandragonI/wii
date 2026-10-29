import { describe, expect, it } from "vitest";

import { getProfile } from "@/config/profile";
import { alternatesFor, localePath, parseLocalePath } from "@/i18n/config";
import { categoryLabel, messagesFor } from "@/i18n/messages";

describe("locale paths", () => {
  it("keeps English at the original URLs and puts French under /fr", () => {
    expect(localePath("en", "/")).toBe("/");
    expect(localePath("en", "/about")).toBe("/about");
    expect(localePath("fr", "/")).toBe("/fr");
    expect(localePath("fr", "/projects/karting")).toBe("/fr/projects/karting");
  });

  it("parses a pathname back into locale and path", () => {
    expect(parseLocalePath("/fr")).toEqual({ locale: "fr", path: "/" });
    expect(parseLocalePath("/fr/about")).toEqual({ locale: "fr", path: "/about" });
    expect(parseLocalePath("/about")).toEqual({ locale: "en", path: "/about" });
    expect(parseLocalePath("/frog")).toEqual({ locale: "en", path: "/frog" });
  });

  it("builds canonical and hreflang alternates", () => {
    expect(alternatesFor("fr", "/about")).toEqual({
      canonical: "/fr/about",
      languages: { en: "/about", fr: "/fr/about" },
    });
  });
});

describe("messages", () => {
  it("translates interpolated strings", () => {
    expect(messagesFor("fr").common.menuHeading("Ada")).toBe("Ada – menu des chaînes");
    expect(messagesFor("fr").projects.count(1)).toContain("1 projet,");
    expect(messagesFor("en").projects.count(2)).toContain("2 projects,");
  });

  it("translates categories and falls back to the original label", () => {
    expect(categoryLabel("fr", "Game")).toBe("Jeu");
    expect(categoryLabel("fr", "Unknown")).toBe("Unknown");
  });
});

describe("profiles", () => {
  it("serves a French profile that shares the same contact details", () => {
    const en = getProfile("en");
    const fr = getProfile("fr");
    expect(fr.email).toBe(en.email);
    expect(fr.links.map((link) => link.href)).toEqual(en.links.map((link) => link.href));
    expect(fr.bio).not.toEqual(en.bio);
  });
});
