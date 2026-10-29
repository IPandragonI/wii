/**
 * Normalized, provider-agnostic models consumed by the UI.
 * Nothing in this file may reference GitHub or Vercel response shapes.
 */

export type ProjectStatus = "production" | "development" | "archived";

/** The animated scene behind a project channel's banner, chosen to match what the project is. */
export const BANNER_THEMES = ["board", "race", "road", "music", "darts", "network", "island", "arcade", "app"] as const;
export type BannerTheme = (typeof BANNER_THEMES)[number];

/** Scenes for the built-in channels (Projects, GitHub, About, LinkedIn, Contact). */
export type SystemScene = "projects" | "github" | "about" | "linkedin" | "contact";

export type ChannelScene = BannerTheme | SystemScene;

/** Where a project's data came from. `fallback` means local sample data, not live metadata. */
export type DataSource = "live" | "fallback";

export interface PortfolioProject {
  /** Stable identifier: `gh-<repositoryId>` or `local-<key>` for fallback entries. */
  id: string;
  slug: string;

  name: string;
  description: string;
  /** Optional long-form copy shown on the detail page. */
  details?: string;
  category: string;

  githubUrl?: string;
  productionUrl?: string;

  technologies: string[];
  highlights: string[];

  coverImage?: string;
  channelIcon?: string;
  banner: BannerTheme;
  /**
   * Internal: true when the banner only came from the category default, so the sync may
   * refine it from the production site's own title and description. Never sent to clients.
   */
  bannerFallback?: boolean;

  /** Image and color published by the production site itself (og:image, theme-color). */
  siteImage?: string;
  siteColor?: string;

  featured: boolean;
  order: number;

  status: ProjectStatus;

  createdAt?: string;
  lastUpdatedAt?: string;
  lastDeploymentAt?: string;

  githubStars?: number;
  githubForks?: number;

  source: DataSource;
}

export interface ProviderIssue {
  provider: "github" | "vercel" | "matching" | "config";
  message: string;
  /**
   * Transient issues (timeouts, 5xx, rate limits) should not overwrite good cached data.
   * Permanent issues (bad credentials, unknown user) degrade gracefully instead.
   */
  transient: boolean;
}

export interface PortfolioData {
  /** All visible projects, in display order. */
  projects: PortfolioProject[];
  /** Visible projects sorted by most recent activity, limited by `recentLimit`. */
  recent: PortfolioProject[];
  source: DataSource;
  lastSyncedAt: string;
  issues: ProviderIssue[];
  vercelEnabled: boolean;
  /** Public profile URL of the configured GitHub account, when one is configured. */
  githubProfileUrl?: string;
}

/** The public shape returned by `GET /api/projects`. */
export interface PublicPortfolioResponse {
  projects: PortfolioProject[];
  source: DataSource;
  lastSyncedAt: string;
}
