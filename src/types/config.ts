import type { BannerTheme, ProjectStatus } from "./project";

/**
 * A manual override. It must identify its repository by `repositoryId` (preferred, survives
 * renames) or `repositoryName`. Every other field is optional and always wins over GitHub data.
 */
export interface ProjectOverride {
  repositoryId?: number;
  repositoryName?: string;

  title?: string;
  slug?: string;
  description?: string;
  details?: string;
  category?: string;
  technologies?: string[];
  highlights?: string[];

  /** Path under /public or an absolute https URL. */
  coverImage?: string;
  channelIcon?: string;
  /** Banner style on the menu; inferred from the icon, topics, and project text when omitted. */
  banner?: BannerTheme;

  featured?: boolean;
  /** `false` hides the project everywhere, regardless of any other rule. */
  visible?: boolean;
  order?: number;
  status?: ProjectStatus;

  /** Vercel project ID (`prj_...`) or exact project name. Takes precedence over automatic matching. */
  vercelProjectId?: string;
  /** Explicit production URL; takes precedence over Vercel. */
  productionUrl?: string;
}

export interface DiscoveryRules {
  includeForks: boolean;
  includeArchived: boolean;
  /** When false, only repositories with an override appear (featured or explicitly visible). */
  autoDiscover: boolean;
  /** Repositories never shown, by name (case-insensitive). The profile README repo is a common one. */
  hiddenRepositories: string[];
  /** Size of the "recent repositories" view. */
  recentLimit: number;
  /** Maximum number of featured project channels on the main menu. */
  menuFeaturedLimit: number;
}

/** A project shown only when live data is unavailable. Rendered with a visible "sample data" notice. */
export interface FallbackProject {
  key: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  technologies: string[];
  channelIcon?: string;
  coverImage?: string;
  banner?: BannerTheme;
  order: number;
}
