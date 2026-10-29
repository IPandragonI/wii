import type { CSSProperties, ReactNode } from "react";

import { SCENES } from "@/components/ui/scenes";
import type { ChannelArtProps } from "@/components/ui/scenes/shared";
import { TINTS } from "@/lib/menu";

export type { ChannelArtProps };

/** Width/height of a menu tile's banner. Banner content is laid out in a box of this shape. */
export const BANNER_ASPECT = 48 / 35;

/**
 * The layout box for banner content: as tall as the banner, unless the banner is narrower
 * than a tile (a phone in portrait), in which case it is as wide as the banner instead.
 * Content sizes use cqh of this box, so a tile and the full-screen preview render the
 * same composition at different scales, and the zoom between them is seamless.
 */
function BannerBox({ children }: { children: ReactNode }) {
  return (
    <div
      className="absolute inset-x-0 top-1/2 -translate-y-1/2"
      style={{ height: `min(100%, calc(100cqw / ${BANNER_ASPECT}))`, containerType: "size" }}
    >
      {children}
    </div>
  );
}

/**
 * A channel banner.
 *
 * Every channel gets an animated scene that fills the whole banner and reflects what it is:
 * a chess board for a chess analyser, a circuit for a racing game, a contribution graph for
 * GitHub, the waving Mii for About Me, and so on.
 * Animations are small transform/opacity loops on HTML wrappers (composited, cheap on
 * phones) and all stop under reduced motion. A compact title plate keeps every tile labeled.
 */
export function ChannelArt(props: ChannelArtProps) {
  const { title, image, tint, priority, decorative = true, banner = "app", hideTitle = false } = props;
  const accent = props.accent ?? TINTS[tint].accent;
  const style = {
    containerType: "size",
    "--tint": accent,
    "--tint-soft": `color-mix(in srgb, ${accent} 14%, white)`,
  } as CSSProperties;

  if (image) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-white" style={style} aria-hidden={decorative || undefined}>
        {/* Plain <img>: remote screenshots are not routed through the image optimizer. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={decorative ? "" : `${title} preview`}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <span className="absolute inset-0 shadow-[inset_0_0_6cqh_rgb(255_255_255/0.85)]" />
      </div>
    );
  }

  const Scene = SCENES[banner];
  return (
    <div
      className="relative h-full w-full overflow-hidden select-none"
      style={{ ...style, background: "var(--tint-soft)" }}
      aria-hidden={decorative || undefined}
    >
      <BannerBox>
        <Scene {...props} accent={accent} />
        {!hideTitle && <TitlePlate title={title} />}
      </BannerBox>
    </div>
  );
}

function TitlePlate({ title }: { title: string }) {
  return (
    <span className="absolute bottom-[5cqh] left-1/2 max-w-[110cqh] -translate-x-1/2 rounded-[3.5cqh] bg-white/90 px-[4.5cqh] py-[1.6cqh] text-center leading-none shadow-[0_0.6cqh_2cqh_rgb(0_0_0/0.12)] ring-1 ring-black/5">
      <span className="block truncate text-[9.5cqh] font-extrabold tracking-tight text-[#5f646b]">{title}</span>
    </span>
  );
}
