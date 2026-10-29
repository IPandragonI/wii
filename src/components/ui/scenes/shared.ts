import type { CSSProperties } from "react";

import type { TintName } from "@/lib/menu";
import type { ChannelScene } from "@/types/project";

export interface ChannelArtProps {
  title: string;
  subtitle?: string;
  icon?: string;
  category?: string;
  /** A screenshot, used only on a project's own page; menu banners are always animated scenes. */
  image?: string;
  /** The project's own color; defaults to the channel tint. */
  accent?: string;
  banner?: ChannelScene;
  tint: TintName;
  priority?: boolean;
  /** Decorative copies (menu tiles, zoom layers) are hidden from assistive technology. */
  decorative?: boolean;
  /** Hide the title plate, e.g. when the image is composed with its own title (social cards). */
  hideTitle?: boolean;
  /** The About scene's speech bubble, in the page's language. */
  greeting?: string;
}

/** What every scene receives: the banner's props plus its resolved accent color. */
export type SceneProps = ChannelArtProps & { accent: string };

/**
 * Positions an element in BannerBox units: x from the center, y from the top, both in cqh.
 * Scenes keep key elements within ±60cqh of the center so menu tiles (≈137cqh wide) show them;
 * wider banners (the full-screen preview) reveal more of the scene at the sides.
 */
export function at(x: number, y: number, width: number, height: number, extra?: CSSProperties): CSSProperties {
  return { left: `calc(50% + ${x}cqh)`, top: `${y}cqh`, width: `${width}cqh`, height: `${height}cqh`, ...extra };
}
