"use client";

import { useAnimate, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";

import { CHANNELS_PER_PAGE } from "@/config/menu";
import { ChannelPreview, ZOOM_IN_SECONDS, ZOOM_OUT_SECONDS } from "@/components/wii-menu/ChannelPreview";
import { EmptyChannel, WiiChannel } from "@/components/wii-menu/WiiChannel";
import { WiiBottomBar } from "@/components/wii-menu/WiiBottomBar";
import type { MenuChannel } from "@/lib/menu";
import { revealScreen } from "@/lib/screen-transition";
import { playSound, setMusic } from "@/lib/sound";

const LAST_CHANNEL_KEY = "wii-portfolio:last-channel";
const COLUMNS = 4;
const ROWS = 3;

/** Zooms happen around a channel, so the grid's transform origin follows the channel. */
function setTransformOrigin(element: HTMLElement, origin: string) {
  element.style.transformOrigin = origin;
}

interface Opening {
  channel: MenuChannel;
  origin: DOMRect;
}

/**
 * Arrow-key focus movement. In the paged 4×3 layout, moving past a page edge continues on the
 * neighboring page in the same row; in the stacked mobile layout it follows the visual grid.
 */
export function nextChannelIndex(index: number, key: string, count: number, columns: number): number {
  if (key === "Home") return 0;
  if (key === "End") return count - 1;

  if (columns !== COLUMNS) {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columns, ArrowDown: columns }[key] ?? 0;
    const next = index + step;
    return next >= 0 && next < count ? next : index;
  }

  const page = Math.floor(index / CHANNELS_PER_PAGE);
  const slot = index % CHANNELS_PER_PAGE;
  const row = Math.floor(slot / COLUMNS);
  const column = slot % COLUMNS;
  const at = (p: number, r: number, c: number) => p * CHANNELS_PER_PAGE + r * COLUMNS + c;

  let next = index;
  if (key === "ArrowRight") next = column < COLUMNS - 1 ? index + 1 : at(page + 1, row, 0);
  if (key === "ArrowLeft") next = column > 0 ? index - 1 : page > 0 ? at(page - 1, row, COLUMNS - 1) : index;
  if (key === "ArrowUp") next = row > 0 ? index - COLUMNS : index;
  if (key === "ArrowDown") next = row < ROWS - 1 ? index + COLUMNS : index;
  if (next >= count) {
    // The target slot on the next page is empty: use that page's last channel instead.
    const nextPage = Math.floor(next / CHANNELS_PER_PAGE);
    next = nextPage > page && count > nextPage * CHANNELS_PER_PAGE ? count - 1 : index;
  }
  return next;
}

export function WiiMenu({ channels, heading }: { channels: MenuChannel[]; heading: string }) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const [page, setPage] = useState(0);
  const [opening, setOpening] = useState<Opening | null>(null);
  const [closing, setClosing] = useState(false);

  const pages: MenuChannel[][] = [];
  for (let index = 0; index < Math.max(channels.length, 1); index += CHANNELS_PER_PAGE) {
    pages.push(channels.slice(index, index + CHANNELS_PER_PAGE));
  }

  const links = () => [...(rootRef.current?.querySelectorAll<HTMLAnchorElement>("a[data-channel]") ?? [])];
  const originOf = (element: Element) => {
    const rect = element.getBoundingClientRect();
    return `${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`;
  };

  // Each visit to the menu (Next.js keeps it mounted but hidden between visits):
  // menu music, lift the white veil, and zoom out from the channel we came back from.
  useEffect(() => {
    setMusic("menu");
    let key: string | null = null;
    try {
      key = sessionStorage.getItem(LAST_CHANNEL_KEY);
      sessionStorage.removeItem(LAST_CHANNEL_KEY);
    } catch {
      // Session storage unavailable; nothing to restore.
    }
    const link = key ? links().find((candidate) => candidate.dataset.channel === key) : undefined;
    // Focusing the link also turns to its page (see the channel's onFocus).
    link?.focus({ preventScroll: true });
    revealScreen();
    if (!reduceMotion && scope.current) {
      setTransformOrigin(scope.current, link ? originOf(link) : "50% 40%");
      void animate(
        scope.current,
        { scale: [link ? 1.18 : 1.03, 1], opacity: [0, 1] },
        { duration: link ? 0.55 : 0.4, ease: [0.2, 0.8, 0.3, 1] },
      );
    }
    return () => {
      setOpening(null);
      setClosing(false);
    };
    // Mount/reveal only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const open = (channel: MenuChannel, art: HTMLElement) => {
    if (opening) return;
    playSound("select");
    try {
      sessionStorage.setItem(LAST_CHANNEL_KEY, channel.key);
    } catch {
      // Ignore; focus restoration is a nicety.
    }
    if (scope.current && !reduceMotion) {
      // The rest of the menu zooms toward the channel along with its banner.
      setTransformOrigin(scope.current, originOf(art));
      void animate(scope.current, { scale: 1.25, opacity: 0 }, { duration: ZOOM_IN_SECONDS, ease: [0.45, 0, 0.15, 1] });
    }
    setOpening({ channel, origin: art.getBoundingClientRect() });
  };

  const onPreviewClosing = () => {
    setClosing(true);
    if (scope.current && !reduceMotion) {
      void animate(scope.current, { scale: 1, opacity: 1 }, { duration: ZOOM_OUT_SECONDS, ease: [0.45, 0, 0.15, 1] });
    }
  };

  const onPreviewClosed = () => {
    const key = opening?.channel.key;
    setOpening(null);
    setClosing(false);
    links()
      .find((link) => link.dataset.channel === key)
      ?.focus({ preventScroll: true });
  };

  const turnPage = (to: number) => {
    if (to < 0 || to >= pages.length || to === page) return;
    playSound("page");
    setPage(to);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const all = links();
    const index = all.indexOf(document.activeElement as HTMLAnchorElement);
    if (index === -1) return;
    const grid = event.currentTarget.querySelector("ul");
    const columns = grid ? getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length || 1 : 1;
    const next = nextChannelIndex(index, event.key, all.length, columns);
    if (next !== index) {
      event.preventDefault();
      all[next].focus({ preventScroll: true });
    }
  };

  const previewOpen = opening !== null && !closing;

  return (
    <>
      <div
        ref={rootRef}
        className="relative flex flex-1 select-none flex-col"
        inert={opening !== null || undefined}
        aria-hidden={opening !== null || undefined}
      >
        <h1 className="sr-only">{heading}</h1>
        <div ref={scope} className="relative flex flex-1 items-center justify-center px-3 pt-4 sm:px-14 sm:pt-6">
          <section
            aria-label="Channels"
            onKeyDown={onKeyDown}
            className="w-full overflow-clip p-1 sm:w-[min(100%,calc((100dvh-172px)*1.7))] sm:p-2"
          >
            <div
              className="flex flex-col gap-3 transition-transform duration-500 ease-[cubic-bezier(0.45,0,0.15,1)] sm:flex-row sm:gap-0 sm:[transform:translateX(calc(var(--page)*-100%))]"
              style={{ "--page": page } as CSSProperties}
            >
              {pages.map((pageChannels, pageIndex) => (
                <ul
                  key={pageIndex}
                  aria-label={pages.length > 1 ? `Page ${pageIndex + 1} of ${pages.length}` : undefined}
                  className="grid w-full shrink-0 grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-x-[2.2%] sm:gap-y-[clamp(10px,2.6vh,24px)] sm:px-1"
                >
                  {pageChannels.map((channel) => (
                    <WiiChannel key={channel.key} channel={channel} onOpen={open} onFocus={() => setPage(pageIndex)} />
                  ))}
                  {Array.from({ length: CHANNELS_PER_PAGE - pageChannels.length }, (_, index) => (
                    <EmptyChannel key={`empty-${index}`} />
                  ))}
                </ul>
              ))}
            </div>
          </section>

          {pages.length > 1 && (
            <>
              <PageArrow direction="left" hidden={page === 0} onClick={() => turnPage(page - 1)} />
              <PageArrow direction="right" hidden={page === pages.length - 1} onClick={() => turnPage(page + 1)} />
            </>
          )}
        </div>
        <WiiBottomBar hidden={previewOpen} />
      </div>

      {opening && (
        <ChannelPreview
          key={opening.channel.key}
          channel={opening.channel}
          origin={opening.origin}
          onClosing={onPreviewClosing}
          onClosed={onPreviewClosed}
        />
      )}
    </>
  );
}

/** Blue page-turn arrows at the screen edges, shown only when there is another page. */
function PageArrow({ direction, hidden, onClick }: { direction: "left" | "right"; hidden: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerEnter={() => playSound("buttonHover")}
      tabIndex={-1}
      aria-label={direction === "left" ? "Previous page" : "Next page"}
      className={`absolute top-1/2 hidden h-16 w-12 -translate-y-1/2 items-center justify-center transition-[opacity,scale] hover:scale-110 sm:flex ${
        direction === "left" ? "left-1" : "right-1"
      } ${hidden ? "pointer-events-none opacity-0" : "opacity-100"}`}
    >
      <svg viewBox="0 0 40 52" className={`h-14 w-11 drop-shadow-[0_2px_4px_rgb(0_0_0/0.2)] ${direction === "left" ? "-scale-x-100" : ""}`} aria-hidden="true">
        <path d="M8 4 Q4 4 4 9 V43 Q4 48 8 48 Q10 48 12 46.5 L35 30 Q38 26 35 22 L12 5.5 Q10 4 8 4 Z" fill="#34beed" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" />
        <path d="M11 12 L28 25" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </button>
  );
}
