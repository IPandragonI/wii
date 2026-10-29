/**
 * Provider models: validated, trimmed-down views of GitHub and Vercel responses.
 * Raw API payloads never leave `src/lib/github.ts` and `src/lib/vercel.ts`.
 */

export interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  description: string | null;
  htmlUrl: string;
  homepage: string | null;
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
  /** Last push; better proxy for "recent work" than `updatedAt`, which also changes on stars. */
  pushedAt: string | null;
  language: string | null;
  topics: string[];
  stars: number;
  forks: number;
  archived: boolean;
  fork: boolean;
  isPrivate: boolean;
}

export type VercelReadyState =
  | "BLOCKED"
  | "BUILDING"
  | "CANCELED"
  | "DELETED"
  | "ERROR"
  | "INITIALIZING"
  | "QUEUED"
  | "READY";

export interface VercelDeploymentInfo {
  id: string;
  url: string;
  readyState: VercelReadyState;
  /** `production`, `staging`, or null for preview deployments. */
  target: string | null;
  createdAt: number;
  aliases: string[];
}

export interface VercelGitLink {
  type: string;
  org?: string;
  repo?: string;
  repoId?: number;
}

export interface VercelProjectInfo {
  id: string;
  name: string;
  link: VercelGitLink | null;
  /** Domains assigned to the production environment (custom domains and `*.vercel.app`). */
  productionDomains: string[];
  /** Production target and latest deployments, as reported by the project endpoint. */
  deployments: VercelDeploymentInfo[];
}

/** Result of selecting what to show for a Vercel project. */
export interface VercelProductionSummary {
  productionUrl?: string;
  lastDeploymentAt?: string;
  /** State of the newest production deployment, even if it is not ready. */
  latestProductionState?: VercelReadyState;
}

export type ProviderResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; transient: boolean };
