/**
 * Main menu layout. Each entry is either a fixed system channel or the `featured` marker,
 * which expands into the featured project channels (up to `discoveryRules.menuFeaturedLimit`).
 */
export type SystemChannelId = "projects" | "github" | "about" | "linkedin" | "contact";

export interface SystemChannel {
  id: SystemChannelId;
  title: string;
  /** Short line shown under the title on the channel's preview. */
  tagline: string;
  href: string;
  icon: string;
}

export const systemChannels: Record<SystemChannelId, SystemChannel> = {
  projects: {
    id: "projects",
    title: "Projects",
    tagline: "Everything I've built",
    href: "/projects",
    icon: "projects",
  },
  github: {
    id: "github",
    title: "GitHub",
    tagline: "Recent activity",
    href: "/github",
    icon: "github",
  },
  about: {
    id: "about",
    title: "About Me",
    tagline: "Who's behind this",
    href: "/about",
    icon: "about",
  },
  linkedin: {
    id: "linkedin",
    title: "LinkedIn",
    tagline: "Professional profile",
    href: "/linkedin",
    icon: "linkedin",
  },
  contact: {
    id: "contact",
    title: "Contact",
    tagline: "Say hello",
    href: "/contact",
    icon: "contact",
  },
};

export const menuLayout: (SystemChannelId | "featured")[] = [
  "featured",
  "projects",
  "github",
  "about",
  "linkedin",
  "contact",
];

/** Channels per menu page. 12 fills complete rows at 2, 3, and 4 columns. */
export const CHANNELS_PER_PAGE = 12;
