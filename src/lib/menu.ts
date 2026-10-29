import { menuLayout, systemChannels, type SystemChannelId } from "@/config/menu";
import { linkedinUrl } from "@/config/profile";
import { safeExternalUrl } from "@/lib/url";
import type { ChannelScene, PortfolioProject } from "@/types/project";

/** The serializable channel model the client menu renders. */
export interface MenuChannel {
  key: string;
  title: string;
  subtitle: string;
  href: string;
  icon?: string;
  category?: string;
  /** The project's own theme color, used as the banner accent when present. */
  accent?: string;
  /** Which animated scene the banner shows. */
  banner: ChannelScene;
  /**
   * Where Start goes for a deployed project: its HTTPS production URL, opened in a new tab.
   * Unset for projects without a deployment and for system channels, which open `href`.
   */
  launchUrl?: string;
  tint: TintName;
}

export const TINTS = {
  cyan: { surface: "#e5f5fc", accent: "#1592d0" },
  green: { surface: "#e7f5eb", accent: "#2f8f4e" },
  orange: { surface: "#fcefe2", accent: "#c0620f" },
  red: { surface: "#fce9e9", accent: "#c03a3a" },
  violet: { surface: "#efebfa", accent: "#6a4ec2" },
  yellow: { surface: "#fbf5dd", accent: "#977300" },
  slate: { surface: "#eef0f3", accent: "#4f5660" },
} as const;

export type TintName = keyof typeof TINTS;

const PROJECT_TINTS: TintName[] = ["green", "orange", "violet", "red", "yellow", "cyan"];

/** A stable tint per project, derived from its slug so it never changes between builds. */
export function tintFor(slug: string): TintName {
  let hash = 0;
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return PROJECT_TINTS[hash % PROJECT_TINTS.length];
}

const SYSTEM_TINTS: Record<string, TintName> = {
  projects: "cyan",
  github: "slate",
  about: "cyan",
  linkedin: "cyan",
  contact: "cyan",
};

/** Only a well-formed https URL can be launched; anything else keeps the internal page. */
export function launchUrlFor(productionUrl: string | undefined): string | undefined {
  const url = safeExternalUrl(productionUrl);
  return url?.startsWith("https://") ? url : undefined;
}

/** System channels that only make sense when configured. */
const SYSTEM_CHANNEL_ENABLED: Partial<Record<SystemChannelId, () => boolean>> = {
  linkedin: () => Boolean(linkedinUrl()),
};

export function projectChannel(project: PortfolioProject): MenuChannel {
  console.log(project);
  return {
    key: project.id,
    title: project.name,
    subtitle: project.category,
    href: `/projects/${project.slug}`,
    icon: project.channelIcon,
    category: project.category,
    accent: project.siteColor,
    banner: project.banner,
    launchUrl: launchUrlFor(project.productionUrl),
    tint: tintFor(project.slug),
  };
}

export function buildMenuChannels(featured: PortfolioProject[]): MenuChannel[] {
  return menuLayout.flatMap((entry): MenuChannel[] => {
    if (entry === "featured") return featured.map(projectChannel);
    if (SYSTEM_CHANNEL_ENABLED[entry]?.() === false) return [];
    const channel = systemChannels[entry];
    return [
      {
        key: `system-${channel.id}`,
        title: channel.title,
        subtitle: channel.tagline,
        href: channel.href,
        icon: channel.icon,
        banner: channel.id,
        tint: SYSTEM_TINTS[channel.id] ?? "slate",
      },
    ];
  });
}
