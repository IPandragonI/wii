"use client";

import { Play } from "lucide-react";
import { motion, useAnimate } from "motion/react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

import { BANNER_ASPECT, ChannelArt } from "@/components/ui/ChannelArt";
import type { MenuChannel } from "@/lib/menu";
import { prefersReducedMotion, useScreenNavigation } from "@/lib/screen-transition";
import { playSound } from "@/lib/sound";

/** Only https URLs may be opened from Start; anything else is ignored. */
export function launchableUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export const ZOOM_IN_SECONDS = 0.52;
export const ZOOM_OUT_SECONDS = 0.42;
const ZOOM_EASE = [0.45, 0, 0.15, 1] as const;

interface ChannelPreviewProps {
  channel: MenuChannel;
  /** Screen rectangle of the tile's banner, where the zoom starts and ends. */
  origin: DOMRect;
  /** Starts the zoom back to the menu; the parent animates the grid alongside. */
  onClosing: () => void;
  /** Called once the preview has fully zoomed back into its tile. */
  onClosed: () => void;
}

/**
 * The channel preview: the tile's banner grows to fill the screen (revealing the rest of the
 * banner around the tile's crop), then "Menu" and "Start" rise in at the bottom.
 *
 * The zoom is two layers: an outer clip that opens from the tile rectangle to the viewport,
 * and the full-screen banner scaled uniformly so its center matches the tile at the start.
 * Only clip-path and transform animate.
 */
export function ChannelPreview({ channel, origin, onClosing, onClosed }: ChannelPreviewProps) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const startRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const [busy, setBusy] = useState(true);
  const titleId = useId();
  const { enterChannel } = useScreenNavigation();

  const geometry = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    // The banner's content box is as tall as the screen, or as wide on a portrait screen.
    const scale = origin.height / Math.min(height, width / BANNER_ASPECT);
    return {
      clip: `inset(${origin.top}px ${width - origin.right}px ${height - origin.bottom}px ${origin.left}px round 13px)`,
      x: origin.left + origin.width / 2 - width / 2,
      y: origin.top + origin.height / 2 - height / 2,
      scale,
    };
  };

  // Start from the tile on the very first paint, so the banner never flashes full-screen.
  const [initial] = useState(() => ({ reduced: prefersReducedMotion(), ...geometry() }));

  useEffect(() => {
    const { reduced } = initial;
    const run = async () => {
      if (!reduced) {
        const { clip, x, y, scale } = geometry();
        await Promise.all([
          animate(scope.current, { clipPath: [clip, "inset(0px 0px 0px 0px round 0px)"] }, { duration: ZOOM_IN_SECONDS, ease: ZOOM_EASE }),
          animate("[data-zoom]", { x: [x, 0], y: [y, 0], scale: [scale, 1] }, { duration: ZOOM_IN_SECONDS, ease: ZOOM_EASE }),
        ]);
      }
      await animate("[data-controls]", { y: ["100%", "0%"], opacity: [0, 1] }, { duration: reduced ? 0 : 0.3, ease: [0.2, 0.9, 0.3, 1] });
      setBusy(false);
      startRef.current?.focus({ preventScroll: true });
    };
    void run();
    // Runs once per opened channel; the origin is fixed for its lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = async () => {
    if (busy) return;
    setBusy(true);
    playSound("zoomOut");
    onClosing();
    const reduced = prefersReducedMotion();
    await animate("[data-controls]", { y: "100%", opacity: 0 }, { duration: reduced ? 0 : 0.16 });
    if (!reduced) {
      const { clip, x, y, scale } = geometry();
      await Promise.all([
        animate(scope.current, { clipPath: clip }, { duration: ZOOM_OUT_SECONDS, ease: ZOOM_EASE }),
        animate("[data-zoom]", { x, y, scale }, { duration: ZOOM_OUT_SECONDS, ease: ZOOM_EASE }),
      ]);
    }
    onClosed();
  };

  // A deployed project starts in a new tab, so the portfolio stays open behind it; anything
  // else (projects without a deployment, built-in channels) enters its channel as before.
  const launchUrl = launchableUrl(channel.launchUrl);

  const start = () => {
    if (busy) return;
    if (launchUrl) {
      playSound("start");
      window.open(launchUrl, "_blank", "noopener,noreferrer");
      return;
    }
    setBusy(true);
    void enterChannel(channel.href);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      void close();
    } else if (event.key === "Tab") {
      // Keep focus on the two buttons, like a modal dialog.
      event.preventDefault();
      (document.activeElement === startRef.current ? menuRef : startRef).current?.focus();
    } else if (event.key === "ArrowLeft") {
      menuRef.current?.focus();
    } else if (event.key === "ArrowRight") {
      startRef.current?.focus();
    }
  };

  return (
    <div
      ref={scope}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onKeyDown={onKeyDown}
      className="fixed inset-0 z-40 select-none overflow-hidden bg-white"
      style={initial.reduced ? undefined : { clipPath: initial.clip }}
    >
      <h2 id={titleId} className="sr-only">
        {channel.title} channel
      </h2>
      <div
        data-zoom
        className="absolute inset-0 origin-center will-change-transform"
        style={initial.reduced ? undefined : { transform: `translate(${initial.x}px, ${initial.y}px) scale(${initial.scale})` }}
      >
        <ChannelArt
          title={channel.title}
          subtitle={channel.subtitle}
          icon={channel.icon}
          category={channel.category}
          accent={channel.accent}
          banner={channel.banner}
          tint={channel.tint}
        />
      </div>

      <motion.div
        data-controls
        style={{ y: "100%", opacity: 0 }}
        className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-4 bg-gradient-to-b from-transparent via-[#eef0f2]/90 to-[#dfe2e6] px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-14 sm:gap-[8vw] sm:pb-12 sm:pt-20"
      >
        <button
          ref={menuRef}
          type="button"
          onClick={() => void close()}
          onPointerEnter={() => playSound("buttonHover")}
          className="wii-button h-16 w-[min(40vw,17rem)] text-xl sm:h-[4.5rem] sm:text-2xl"
        >
          Menu
        </button>
        <button
          ref={startRef}
          type="button"
          onClick={start}
          onPointerEnter={() => playSound("buttonHover")}
          className="wii-button wii-button-primary h-16 w-[min(40vw,17rem)] text-xl sm:h-[4.5rem] sm:text-2xl"
        >
          <Play aria-hidden="true" size={20} className="fill-current" />
          Start
          {launchUrl && <span className="sr-only">(opens {channel.title} in a new tab)</span>}
        </button>
      </motion.div>
    </div>
  );
}
