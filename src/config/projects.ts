import type { DiscoveryRules, FallbackProject, ProjectOverride } from "@/types/config";

/**
 * Manual curation. Overrides always win over GitHub and Vercel data, and the sync never
 * writes to this file.
 *
 * An override only applies when its repository is actually found on GitHub. If the
 * repository is missing or renamed, the override is skipped and reported, and no channel
 * is created for it. Prefer `repositoryId` (stable across renames) once you know it:
 * `curl https://api.github.com/repos/<user>/<repo> | grep '"id"'`.
 *
 * Deployment links. Each repository below is pinned by its GitHub `repositoryId` and, when it
 * is deployed on Vercel, by its `vercelProjectId` (`prj_...`). Both are stable identifiers
 * (checked against the GitHub and Vercel APIs); names can change, IDs cannot. The production
 * URL itself is then read from Vercel at sync time, so it follows domain changes. A project
 * with no `vercelProjectId` and no `productionUrl` has no deployment and opens its detail page.
 * To pin a URL by hand (no Vercel lookup at all), set `productionUrl`.
 */
export const projectOverrides: ProjectOverride[] = [
  {
    repositoryId: 1426707666,
    repositoryName: "Checkout",
    vercelProjectId: "prj_KsXuERfThA0r8Mnu6bsXw2Ws5Omq",
    title: "Checkout",
    channelIcon: "dart",
    featured: true,
    order: 1,
  },
  {
    repositoryId: 1433429338,
    repositoryName: "Karting",
    vercelProjectId: "prj_h8OkCbF9nDNrtyBcDFkA9rUfx2uj",
    title: "Karting",
    channelIcon: "kart",
    featured: true,
    order: 2,
  },
  {
    repositoryId: 1431569754,
    repositoryName: "Outpost",
    vercelProjectId: "prj_Fgp0iNIrVaHhz6l24l80RBfcVsX9",
    title: "Outpost",
    channelIcon: "outpost",
    featured: true,
    order: 3,
  },
  {
    repositoryId: 1428104371,
    repositoryName: "Cherry",
    vercelProjectId: "prj_SRFvwhawiga0wnh9Cx0gamuN8Aw1",
    title: "Cherry",
    channelIcon: "cherry",
    featured: true,
    order: 4,
  },
  {
    repositoryId: 1432125260,
    repositoryName: "Calandre",
    vercelProjectId: "prj_CAwVIMA4IJNrlMecZfIYKzXbSCf6",
    title: "Calandre",
    channelIcon: "calandre",
    featured: true,
    order: 5,
  },
  {
    // Not deployed on Vercel: no vercelProjectId, so it opens its detail page.
    repositoryId: 1409005892,
    repositoryName: "Autonomous_Vehicles",
    title: "Autonomous Vehicles",
    channelIcon: "autonomous",
    featured: true,
    order: 6,
  },
];

export const discoveryRules: DiscoveryRules = {
  includeForks: false,
  includeArchived: false,
  autoDiscover: true,
  hiddenRepositories: [],
  recentLimit: 12,
  menuFeaturedLimit: 6,
};

/**
 * Shown only when GitHub cannot be reached and nothing is cached, or when GITHUB_USERNAME is
 * not configured (local development). The UI labels these entries as sample data and shows
 * no stars, dates, or links for them.
 */
export const fallbackProjects: FallbackProject[] = [
  {
    key: "karting",
    name: "Karting",
    slug: "karting",
    description: "A small browser karting game with drifting, time trials, and a track editor.",
    category: "Game",
    technologies: [],
    channelIcon: "kart",
    order: 1,
  },
  {
    key: "cherry",
    name: "Cherry",
    slug: "cherry",
    description: "A guitar tuner, chord library, and chord finder.",
    category: "Web app",
    technologies: [],
    channelIcon: "cherry",
    order: 2,
  },
  {
    key: "outpost",
    name: "Outpost",
    slug: "outpost",
    description:
      "Private chess game analysis in the browser: Stockfish evaluations, move classification, opening theory, and variation exploration. Works offline.",
    category: "Web app",
    technologies: [],
    channelIcon: "chess",
    order: 3,
  },
  {
    key: "calandre",
    name: "Calandre",
    slug: "calandre",
    description: "A car quiz: one photo, one car. Find the make and model, from the 2CV to the Bugatti.",
    category: "Game",
    technologies: [],
    channelIcon: "car",
    order: 4,
  },
  {
    key: "checkout",
    name: "Checkout",
    slug: "checkout",
    description: "A fast 501/301 darts scorer with checkout help and multi-device rooms.",
    category: "Web app",
    technologies: [],
    banner: "darts",
    order: 5,
  },
];
