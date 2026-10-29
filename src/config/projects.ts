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
 * The repository names below are guesses. Rename them to match your GitHub repositories.
 */
export const projectOverrides: ProjectOverride[] = [
  {
    repositoryName: "checkout",
    title: "Checkout",
    channelIcon: "dart",
    featured: true,
    order: 1,
  },
  {
    repositoryName: "karting",
    title: "Karting",
    channelIcon: "kart",
    featured: true,
    order: 2,
  }, {
    repositoryName: "outpost",
    title: "Outpost",
    channelIcon: "outpost",
    featured: true,
    order: 3,
  },
  {
    repositoryName: "cherry",
    title: "Cherry",
    channelIcon: "cherry",
    featured: true,
    order: 4,
  }, {
    repositoryName: "calandre",
    title: "Calandre",
    channelIcon: "calandre",
    featured: true,
    order: 5,
  }, {
    repositoryName: "autonomous_vehicles",
    title: "Autonomous Vehicles",
    channelIcon: "autonomous",
    featured: true,
    order: 5,
  }
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
    key: "islebound",
    name: "Islebound",
    slug: "islebound",
    description: "An island-building game.",
    category: "Game",
    technologies: [],
    channelIcon: "island",
    order: 1,
  },
  {
    key: "kart-racing",
    name: "Kart Racing",
    slug: "kart-racing",
    description: "A kart racing game.",
    category: "Game",
    technologies: [],
    channelIcon: "kart",
    order: 2,
  },
  {
    key: "checkmate",
    name: "Checkmate",
    slug: "checkmate",
    description: "A chess analysis application.",
    category: "Web app",
    technologies: [],
    channelIcon: "chess",
    order: 3,
  },
  {
    key: "carspotter",
    name: "Carspotter",
    slug: "carspotter",
    description: "A car recognition game.",
    category: "Game",
    technologies: [],
    channelIcon: "car",
    order: 4,
  },
];
