import { selectProduction } from "@/lib/vercel";
import { prettifyRepositoryName, safeExternalUrl, safeImageSrc, slugify } from "@/lib/url";
import type { DiscoveryRules, FallbackProject, ProjectOverride } from "@/types/config";
import type { BannerTheme, PortfolioProject, ProviderIssue } from "@/types/project";
import type { GitHubRepository, VercelProjectInfo } from "@/types/providers";

const DEFAULT_ORDER = 1000;
const DEFAULT_CATEGORY = "Project";

/** GitHub topics that name a technology, mapped to their display names. Other topics are ignored. */
const TOPIC_TECHNOLOGIES: Record<string, string> = {
  nextjs: "Next.js",
  react: "React",
  reactjs: "React",
  typescript: "TypeScript",
  javascript: "JavaScript",
  tailwindcss: "Tailwind CSS",
  tailwind: "Tailwind CSS",
  threejs: "Three.js",
  "react-three-fiber": "React Three Fiber",
  r3f: "React Three Fiber",
  vite: "Vite",
  nodejs: "Node.js",
  node: "Node.js",
  vue: "Vue",
  svelte: "Svelte",
  webgl: "WebGL",
  webgpu: "WebGPU",
  canvas: "Canvas",
  tensorflow: "TensorFlow",
  tensorflowjs: "TensorFlow.js",
  python: "Python",
  prisma: "Prisma",
  postgresql: "PostgreSQL",
  supabase: "Supabase",
  "framer-motion": "Motion",
  motion: "Motion",
  zustand: "Zustand",
  "stockfish": "Stockfish",
};

const GAME_TOPICS = new Set(["game", "games", "gamedev", "game-development", "browser-game"]);

// ---------------------------------------------------------------------------------------------
// Overrides

export interface OverrideIndex {
  byId: Map<number, ProjectOverride>;
  byName: Map<string, ProjectOverride>;
}

export function indexOverrides(overrides: ProjectOverride[]): { index: OverrideIndex; issues: ProviderIssue[] } {
  const index: OverrideIndex = { byId: new Map(), byName: new Map() };
  const issues: ProviderIssue[] = [];
  for (const override of overrides) {
    if (override.repositoryId === undefined && !override.repositoryName) {
      issues.push(configIssue("An override has neither repositoryId nor repositoryName and was ignored"));
      continue;
    }
    if (override.repositoryId !== undefined) index.byId.set(override.repositoryId, override);
    if (override.repositoryName) index.byName.set(override.repositoryName.toLowerCase(), override);
  }
  return { index, issues };
}

export function findOverride(index: OverrideIndex, repository: GitHubRepository): ProjectOverride | undefined {
  return index.byId.get(repository.id) ?? index.byName.get(repository.name.toLowerCase());
}

// ---------------------------------------------------------------------------------------------
// Visibility

export type VisibilityDecision = "hidden" | "explicit" | "discovered";

/**
 * Hidden always wins. Otherwise featured or explicitly visible repositories are shown even
 * when they are forks or archived; everything else must pass the automatic discovery rules.
 */
export function decideVisibility(
  repository: GitHubRepository,
  override: ProjectOverride | undefined,
  rules: DiscoveryRules,
): VisibilityDecision {
  if (repository.isPrivate) return "hidden";
  if (override?.visible === false) return "hidden";
  if (rules.hiddenRepositories.some((name) => name.toLowerCase() === repository.name.toLowerCase())) return "hidden";

  if (override && (override.featured || override.visible === true)) return "explicit";
  if (repository.fork && !rules.includeForks) return "hidden";
  if (repository.archived && !rules.includeArchived) return "hidden";
  if (override) return "explicit";
  return rules.autoDiscover ? "discovered" : "hidden";
}

// ---------------------------------------------------------------------------------------------
// GitHub <-> Vercel matching

export interface MatchResult {
  matches: Map<number, VercelProjectInfo>;
  issues: ProviderIssue[];
}

function linksTo(project: VercelProjectInfo, repository: GitHubRepository): boolean {
  const link = project.link;
  if (!link || link.type !== "github") return false;
  if (link.repoId !== undefined) return link.repoId === repository.id;
  return (
    link.org?.toLowerCase() === repository.owner.toLowerCase() &&
    link.repo?.toLowerCase() === repository.name.toLowerCase()
  );
}

/**
 * Matching priority per repository:
 *   1. The override's `vercelProjectId` (project ID or exact name). If it is set but not
 *      found, the repository is left unmatched rather than guessed.
 *   2. Vercel projects whose Git link points at the repository (by repo ID, else owner/name).
 *   3. A Vercel project with the same name that has no Git link of its own.
 * Several candidates at one level is ambiguous: the repository is left unmatched and an
 * issue asks for an explicit `vercelProjectId`. Projects claimed by an override are never
 * auto-matched to a different repository.
 */
export function matchVercelProjects(
  repositories: GitHubRepository[],
  vercelProjects: VercelProjectInfo[],
  overrides: OverrideIndex,
): MatchResult {
  const matches = new Map<number, VercelProjectInfo>();
  const issues: ProviderIssue[] = [];
  const claimed = new Set<string>();
  const automatic: GitHubRepository[] = [];

  for (const repository of repositories) {
    const wanted = findOverride(overrides, repository)?.vercelProjectId;
    if (!wanted) {
      automatic.push(repository);
      continue;
    }
    const project =
      vercelProjects.find((candidate) => candidate.id === wanted) ??
      vercelProjects.find((candidate) => candidate.name === wanted);
    if (project) {
      matches.set(repository.id, project);
      claimed.add(project.id);
    } else {
      issues.push({
        provider: "matching",
        message: `Vercel project "${wanted}" configured for ${repository.name} was not found`,
        transient: false,
      });
    }
  }

  for (const repository of automatic) {
    const available = vercelProjects.filter((project) => !claimed.has(project.id));

    const linked = available.filter((project) => linksTo(project, repository));
    const named = linked.length
      ? []
      : available.filter(
          (project) => project.name.toLowerCase() === repository.name.toLowerCase() && project.link === null,
        );
    const candidates = linked.length ? linked : named;

    if (candidates.length === 1) {
      matches.set(repository.id, candidates[0]);
    } else if (candidates.length > 1) {
      issues.push({
        provider: "matching",
        message: `${repository.name} matches ${candidates.length} Vercel projects (${candidates
          .map((project) => project.name)
          .join(", ")}); set vercelProjectId in src/config/projects.ts`,
        transient: false,
      });
    }
  }

  return { matches, issues };
}

// ---------------------------------------------------------------------------------------------
// Normalization

function technologiesFor(repository: GitHubRepository, languages: string[] | undefined): string[] {
  const fromLanguages = languages?.length ? languages.slice(0, 4) : repository.language ? [repository.language] : [];
  const fromTopics = repository.topics.flatMap((topic) => TOPIC_TECHNOLOGIES[topic.toLowerCase()] ?? []);
  return [...new Set([...fromLanguages, ...fromTopics])];
}

/** Banner themes suggested by a configured channel icon (brand icons such as "cherry" suggest none). */
const ICON_BANNERS: Record<string, BannerTheme> = {
  chess: "board",
  island: "island",
  kart: "race",
  car: "road",
  scan: "road",
  game: "arcade",
  code: "app",
};

/** Banner themes suggested by GitHub topics, checked in this order. */
const TOPIC_BANNERS: [string[], BannerTheme][] = [
  [["chess", "stockfish", "chess-engine"], "board"],
  [["racing", "kart", "racing-game"], "race"],
  [["music", "guitar", "tuner", "audio", "chords"], "music"],
  [["darts", "dart-scorer"], "darts"],
  [["neural-network", "machine-learning", "deep-learning", "ai", "llm", "agents"], "network"],
  [["cars", "car", "car-recognition", "vehicles"], "road"],
  [["island", "sandbox", "city-builder", "simulation", "threejs", "3d"], "island"],
];

/**
 * Words in a project's name, description, production hostname, or its site's own title and
 * description that suggest a theme, in English and French. Checked in this order, so a
 * "neural network for autonomous vehicles" is a network before it is a road.
 */
const KEYWORD_BANNERS: [string[], BannerTheme][] = [
  [["chess", "checkmate", "stockfish", "echecs"], "board"],
  [["kart", "karting", "racing", "race", "racer", "drift", "drifting", "circuit"], "race"],
  [["guitar", "guitare", "guitarist", "guitarists", "tuner", "accordeur", "chord", "chords", "accords", "music", "musique"], "music"],
  [["dart", "darts", "flechette", "flechettes", "501", "301"], "darts"],
  [["neural", "network", "agent", "agents", "llm", "intelligence"], "network"],
  [["car", "cars", "vehicle", "vehicles", "automobile", "voiture", "voitures", "auto"], "road"],
  [["island", "islands", "sandbox", "voxel", "ile"], "island"],
  [["game", "games", "jeu", "jeux", "arcade"], "arcade"],
];

function words(text: string | undefined): Set<string> {
  return new Set(
    (text ?? "")
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .split(/[^a-z0-9]+/),
  );
}

/** The theme suggested by free text alone, if any. */
export function bannerFromText(text: string | undefined): BannerTheme | undefined {
  const found = words(text);
  return KEYWORD_BANNERS.find(([candidates]) => candidates.some((word) => found.has(word)))?.[1];
}

/** The category default used when nothing more specific is known. */
export function defaultBanner(category: string): BannerTheme {
  return category.toLowerCase() === "game" ? "arcade" : "app";
}

interface BannerInput {
  banner?: BannerTheme;
  icon?: string;
  topics?: string[];
  /** Free text to scan for keywords: name, description, production hostname. */
  text?: string;
  category: string;
}

/** The specific theme for a project, or undefined when only the category default applies. */
export function matchBanner(options: BannerInput): BannerTheme | undefined {
  if (options.banner) return options.banner;
  if (options.icon && ICON_BANNERS[options.icon]) return ICON_BANNERS[options.icon];
  const topics = new Set((options.topics ?? []).map((topic) => topic.toLowerCase()));
  const topic = TOPIC_BANNERS.find(([candidates]) => candidates.some((candidate) => topics.has(candidate)));
  return topic?.[1] ?? bannerFromText(options.text);
}

/**
 * Picks a banner theme: the override wins, then the channel icon, then GitHub topics, then
 * keywords in the project's text, then the category (games get the arcade scene, everything
 * else the app scene).
 */
export function inferBanner(options: BannerInput): BannerTheme {
  return matchBanner(options) ?? defaultBanner(options.category);
}

function categoryFor(repository: GitHubRepository): string {
  return repository.topics.some((topic) => GAME_TOPICS.has(topic.toLowerCase())) ? "Game" : DEFAULT_CATEGORY;
}

export function normalizeRepositoryProject(
  repository: GitHubRepository,
  override: ProjectOverride | undefined,
  vercelProject: VercelProjectInfo | undefined,
  languages: string[] | undefined,
): PortfolioProject {
  const vercel = vercelProject ? selectProduction(vercelProject) : undefined;
  const productionUrl =
    safeExternalUrl(override?.productionUrl) ??
    vercel?.productionUrl ??
    safeExternalUrl(repository.homepage)?.replace(/^http:/, "https:");

  const status =
    override?.status ?? (repository.archived ? "archived" : productionUrl ? "production" : "development");
  const category = override?.category?.trim() || categoryFor(repository);
  const banner = matchBanner({
    banner: override?.banner,
    icon: override?.channelIcon,
    topics: repository.topics,
    text: [repository.name, repository.description, productionUrl && new URL(productionUrl).hostname].filter(Boolean).join(" "),
    category,
  });

  return {
    id: `gh-${repository.id}`,
    slug: slugify(override?.slug ?? repository.name) || `project-${repository.id}`,
    name: override?.title?.trim() || prettifyRepositoryName(repository.name),
    description: override?.description?.trim() || repository.description || "",
    details: override?.details?.trim() || undefined,
    category,
    githubUrl: safeExternalUrl(repository.htmlUrl, ["github.com"]),
    productionUrl,
    technologies: override?.technologies ?? technologiesFor(repository, languages),
    highlights: override?.highlights ?? [],
    coverImage: safeImageSrc(override?.coverImage),
    channelIcon: override?.channelIcon,
    banner: banner ?? defaultBanner(category),
    bannerFallback: banner === undefined || undefined,
    featured: override?.featured ?? false,
    order: override?.order ?? DEFAULT_ORDER,
    status,
    createdAt: repository.createdAt,
    lastUpdatedAt: repository.pushedAt ?? repository.updatedAt,
    lastDeploymentAt: vercel?.lastDeploymentAt,
    githubStars: repository.stars,
    githubForks: repository.forks,
    source: "live",
  };
}

/** Display order: explicit `order` first, then most recently updated, then name. */
export function compareProjects(a: PortfolioProject, b: PortfolioProject): number {
  if (a.order !== b.order) return a.order - b.order;
  const byDate = compareByRecency(a, b);
  if (byDate !== 0) return byDate;
  return a.name.localeCompare(b.name);
}

export function compareByRecency(a: PortfolioProject, b: PortfolioProject): number {
  const left = a.lastUpdatedAt ? Date.parse(a.lastUpdatedAt) : 0;
  const right = b.lastUpdatedAt ? Date.parse(b.lastUpdatedAt) : 0;
  return right - left;
}

/**
 * Makes slugs unique. Projects keep their slug in display order; later duplicates get a
 * numeric suffix, so the outcome depends only on the configuration and repository data.
 */
export function assignUniqueSlugs(projects: PortfolioProject[]): { projects: PortfolioProject[]; issues: ProviderIssue[] } {
  const used = new Set<string>();
  const issues: ProviderIssue[] = [];
  const result = projects.map((project) => {
    let slug = project.slug;
    for (let suffix = 2; used.has(slug); suffix += 1) slug = `${project.slug}-${suffix}`;
    if (slug !== project.slug) issues.push(configIssue(`Slug "${project.slug}" is used twice; ${project.name} uses "${slug}"`));
    used.add(slug);
    return slug === project.slug ? project : { ...project, slug };
  });
  return { projects: result, issues };
}

export interface BuildPortfolioInput {
  repositories: GitHubRepository[];
  vercelProjects: VercelProjectInfo[] | null;
  overrides: ProjectOverride[];
  rules: DiscoveryRules;
  languages?: Map<number, string[]>;
}

export interface BuildPortfolioOutput {
  projects: PortfolioProject[];
  recent: PortfolioProject[];
  issues: ProviderIssue[];
}

export function buildPortfolio(input: BuildPortfolioInput): BuildPortfolioOutput {
  const { index, issues } = indexOverrides(input.overrides);
  const repositories = [...new Map(input.repositories.map((repository) => [repository.id, repository])).values()];

  const visible = repositories.filter(
    (repository) => decideVisibility(repository, findOverride(index, repository), input.rules) !== "hidden",
  );

  const usedOverrides = new Set(repositories.map((repository) => findOverride(index, repository)).filter(Boolean));
  for (const override of input.overrides) {
    if (override.visible !== false && !usedOverrides.has(override)) {
      issues.push(
        configIssue(
          `Override for "${override.repositoryName ?? override.repositoryId}" does not match any public repository`,
        ),
      );
    }
  }

  const match = input.vercelProjects
    ? matchVercelProjects(visible, input.vercelProjects, index)
    : { matches: new Map<number, VercelProjectInfo>(), issues: [] };
  issues.push(...match.issues);

  const normalized = visible
    .map((repository) =>
      normalizeRepositoryProject(
        repository,
        findOverride(index, repository),
        match.matches.get(repository.id),
        input.languages?.get(repository.id),
      ),
    )
    .sort(compareProjects);

  const unique = assignUniqueSlugs(normalized);
  issues.push(...unique.issues);

  return {
    projects: unique.projects,
    recent: [...unique.projects].sort(compareByRecency).slice(0, input.rules.recentLimit),
    issues,
  };
}

export function buildFallbackPortfolio(fallback: FallbackProject[]): PortfolioProject[] {
  const projects = fallback.map(
    (entry): PortfolioProject => ({
      id: `local-${entry.key}`,
      slug: slugify(entry.slug) || `local-${slugify(entry.key)}`,
      name: entry.name,
      description: entry.description,
      category: entry.category,
      technologies: entry.technologies,
      highlights: [],
      channelIcon: entry.channelIcon,
      banner: inferBanner({
        banner: entry.banner,
        icon: entry.channelIcon,
        text: `${entry.name} ${entry.description}`,
        category: entry.category,
      }),
      coverImage: safeImageSrc(entry.coverImage),
      featured: true,
      order: entry.order,
      status: "development",
      source: "fallback",
    }),
  );
  return assignUniqueSlugs(projects.sort(compareProjects)).projects;
}

function configIssue(message: string): ProviderIssue {
  return { provider: "config", message, transient: false };
}
