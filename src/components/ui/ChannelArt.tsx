import type { CSSProperties, ReactNode } from "react";

import { MotionGate } from "@/components/ui/MotionGate";
import { TINTS, type TintName } from "@/lib/menu";
import type { ChannelScene } from "@/types/project";

interface ChannelArtProps {
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
}

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

/** Positions an element in BannerBox units: x from the center, y from the top, both in cqh. */
function at(x: number, y: number, width: number, height: number, extra?: CSSProperties): CSSProperties {
  return { left: `calc(50% + ${x}cqh)`, top: `${y}cqh`, width: `${width}cqh`, height: `${height}cqh`, ...extra };
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
  const { title, image, tint, priority, decorative = true, banner = "app" } = props;
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
        <TitlePlate title={title} />
      </BannerBox>
    </div>
  );
}

type SceneProps = ChannelArtProps & { accent: string };

function TitlePlate({ title }: { title: string }) {
  return (
    <span className="absolute bottom-[5cqh] left-1/2 max-w-[110cqh] -translate-x-1/2 rounded-[3.5cqh] bg-white/90 px-[4.5cqh] py-[1.6cqh] text-center leading-none shadow-[0_0.6cqh_2cqh_rgb(0_0_0/0.12)] ring-1 ring-black/5">
      <span className="block truncate text-[9.5cqh] font-extrabold tracking-tight text-[#5f646b]">{title}</span>
    </span>
  );
}

// ---------------------------------------------------------------------------------------------
// Scenes. Key elements stay within ±60cqh of the center so menu tiles (≈137cqh wide) show them;
// wider banners (the full-screen preview) reveal more of the scene at the sides.

/** Chess analysis: a board in perspective, a knight hopping between squares, a best-move
 *  arrow, and an evaluation bar that leans one way and then the other. */
function BoardScene() {
  return (
    <>
      <span className="absolute inset-0 bg-gradient-to-b from-[#fbf7ef] to-[#f1e6d0]" />
      <span
        className="absolute bottom-0 left-1/2 h-[110cqh] w-[340cqh] origin-bottom"
        style={{
          transform: "translateX(-50%) perspective(160cqh) rotateX(50deg)",
          background: "repeating-conic-gradient(#c99c66 0 25%, #f7ecd6 0 50%) 50% 0 / 24cqh 24cqh",
          boxShadow: "inset 0 8cqh 8cqh -3cqh #f1e6d0",
        }}
      />
      {/* Best-move arrow, fading in and out. */}
      <svg viewBox="0 0 60 30" className="wii-arrow wii-ambient absolute" style={at(-10, 50, 40, 20)} aria-hidden="true">
        <path d="M4 24 Q 26 2 50 10" fill="none" stroke="#3aa55d" strokeWidth="4" strokeLinecap="round" opacity="0.75" />
        <path d="M44 3 L56 10 L44 16 Z" fill="#3aa55d" opacity="0.75" />
      </svg>
      <ChessPiece kind="king" dark style={at(-40, 30, 18, 36)} />
      <ChessPiece kind="pawn" style={at(26, 46, 12, 22)} />
      <span className="wii-knight wii-ambient absolute" style={at(-16, 40, 16, 28)}>
        <ChessPiece kind="knight" style={{ position: "absolute", inset: 0 }} />
      </span>
      {/* Evaluation bar */}
      <span className="absolute overflow-hidden rounded-[1cqh] bg-[#2b2b2e] shadow-[0_0.5cqh_1.5cqh_rgb(0_0_0/0.2)]" style={at(-62, 10, 4.5, 58)}>
        <span className="wii-eval wii-ambient absolute inset-x-0 bottom-0 h-full origin-bottom bg-[#f6f3ea]" />
      </span>
    </>
  );
}

function ChessPiece({ kind, dark = false, style }: { kind: "king" | "pawn" | "knight"; dark?: boolean; style: CSSProperties }) {
  const fill = dark ? "#3f2c22" : "#fffaf0";
  const stroke = dark ? "#2a1c15" : "#b08a5a";
  return (
    <svg viewBox="0 0 30 50" className="absolute drop-shadow-[0_0.8cqh_0.6cqh_rgb(0_0_0/0.2)]" style={style} aria-hidden="true">
      <g fill={fill} stroke={stroke} strokeWidth="1.4" strokeLinejoin="round">
        {kind === "king" && (
          <>
            <rect x="13.5" y="1" width="3" height="9" rx="1" />
            <rect x="10" y="3.5" width="10" height="3" rx="1" />
            <path d="M7 14 Q15 8 23 14 L20 38 L10 38 Z" />
          </>
        )}
        {kind === "pawn" && (
          <>
            <circle cx="15" cy="18" r="6.5" />
            <path d="M10 25 Q15 22 20 25 L22 38 L8 38 Z" />
          </>
        )}
        {kind === "knight" && <path d="M8 38 L9 28 Q6 24 9 19 L13 12 L12 7 L17 10 Q25 13 24 24 L23 38 Z" />}
        <rect x="5" y="38" width="20" height="5" rx="2" />
        <rect x="3" y="43" width="24" height="6" rx="2.5" />
      </g>
      {kind === "knight" && <circle cx="17" cy="16" r="1.2" fill={stroke} />}
    </svg>
  );
}

/** Racing: a top-down circuit with kerbs and a checkered line, and two karts lapping it. */
const CIRCUIT = "M -40 20 L 40 20 A 30 30 0 0 1 40 80 L 10 80 Q -4 80 -12 66 Q -20 52 -40 58 L -62 64 A 22 22 0 0 1 -62 20 Z";

function Kart({ color }: { color: string }) {
  return (
    <g>
      <rect x="-3.6" y="-2.2" width="7.2" height="4.4" rx="1.4" fill={color} stroke="#1d2024" strokeWidth="0.6" />
      <circle cx="0.6" cy="0" r="1.3" fill="#f6f3ea" />
    </g>
  );
}

function RaceScene() {
  const lap = (color: string, seconds: number, begin: number) => (
    <g>
      <Kart color={color} />
      <animateMotion dur={`${seconds}s`} begin={`${begin}s`} repeatCount="indefinite" rotate="auto" path={CIRCUIT} />
    </g>
  );
  return (
    <>
      <span className="absolute inset-0 bg-[#7cc96b]" />
      <span
        className="absolute inset-0 opacity-50"
        style={{ background: "repeating-linear-gradient(90deg, transparent 0 9cqh, rgb(255 255 255 / 0.18) 9cqh 18cqh)" }}
      />
      <svg viewBox="-188.5 0 377 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {/* Low-poly trees around the track */}
        {[
          [-105, 18],
          [-95, 78],
          [78, 14],
          [92, 70],
          [-20, 40],
          [12, 44],
          [118, 40],
          [-140, 50],
        ].map(([x, y]) => (
          <polygon key={`${x}${y}`} points={`${x},${y - 6} ${x + 5},${y + 4} ${x - 5},${y + 4}`} fill="#3f9a4c" stroke="#327d3d" strokeWidth="0.6" />
        ))}
        <path d={CIRCUIT} fill="none" stroke="#e94b4b" strokeWidth="17" strokeDasharray="4 4" strokeLinejoin="round" />
        <path d={CIRCUIT} fill="none" stroke="#ffffff" strokeWidth="17" strokeDasharray="4 4" strokeDashoffset="4" strokeLinejoin="round" opacity="0.9" />
        <path d={CIRCUIT} fill="none" stroke="#61666f" strokeWidth="14" strokeLinejoin="round" />
        <path d={CIRCUIT} fill="none" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="0.8" strokeDasharray="5 6" />
        {/* Drift marks in the hairpin */}
        <path d="M -22 61 Q -30 53 -42 56" fill="none" stroke="#2c2f35" strokeOpacity="0.35" strokeWidth="1.2" />
        <path d="M -20 64 Q -28 56 -40 59" fill="none" stroke="#2c2f35" strokeOpacity="0.3" strokeWidth="1.2" />
        {/* Start/finish line */}
        {Array.from({ length: 14 }, (_, index) => (
          <rect key={index} x={-2 + (index % 2) * 2} y={13 + Math.floor(index / 2) * 2} width="2" height="2" fill={(index + Math.floor(index / 2)) % 2 ? "#ffffff" : "#1d2024"} />
        ))}
        <MotionGate
          animated={
            <>
              {lap("#e5484d", 7, 0)}
              {lap("#2d8fd5", 7.6, -2.4)}
            </>
          }
          still={
            <>
              <g transform="translate(-10 18)">
                <Kart color="#e5484d" />
              </g>
              <g transform="translate(-22 22)">
                <Kart color="#2d8fd5" />
              </g>
            </>
          }
        />
      </svg>
    </>
  );
}

/** Car quiz: a road rushing to the horizon, light streaks passing, and a camera viewfinder
 *  that now and then takes a "photo". */
function RoadScene() {
  return (
    <>
      <span className="absolute inset-0 bg-gradient-to-b from-[#9fd3f5] via-[#d9efff] to-[#f6e7d2]" />
      <span className="absolute rounded-full bg-[#ffe9a8] shadow-[0_0_8cqh_#ffe9a8]" style={at(28, 14, 16, 16)} />
      <span className="absolute rounded-[50%] bg-[#9fcf8a]" style={at(-130, 36, 130, 30)} />
      <span className="absolute rounded-[50%] bg-[#8cc678]" style={at(-10, 38, 150, 26)} />
      <span className="absolute inset-x-0 bottom-0 h-[52cqh] bg-[#7cbf67]" />
      <span
        className="absolute bottom-0 left-1/2 h-[52cqh] w-[160cqh] -translate-x-1/2 overflow-hidden bg-[#5d636e]"
        style={{ clipPath: "polygon(47% 0, 53% 0, 100% 100%, 0 100%)" }}
      >
        <span
          className="wii-lane wii-ambient absolute -top-[12cqh] left-1/2 h-[calc(100%+12cqh)] w-[2.4cqh] -translate-x-1/2"
          style={{ background: "repeating-linear-gradient(to bottom, #fff 0 6cqh, transparent 6cqh 12cqh)" }}
        />
      </span>
      {/* Light streaks, like passing headlights */}
      {[
        [14, 0, "#ffffff"],
        [22, -1.3, "#ffd27a"],
        [30, -2.6, "#ffffff"],
      ].map(([y, delay, color]) => (
        <span
          key={String(y)}
          className="wii-streak wii-ambient absolute rounded-full"
          style={{ ...at(-90, Number(y) + 30, 40, 1.2), background: `linear-gradient(to right, transparent, ${color})`, animationDelay: `${delay}s` }}
        />
      ))}
      {/* Viewfinder */}
      <span className="wii-viewfinder wii-ambient absolute" style={at(-34, 10, 68, 52)}>
        {[
          "left-0 top-0 border-l-[1cqh] border-t-[1cqh]",
          "right-0 top-0 border-r-[1cqh] border-t-[1cqh]",
          "bottom-0 left-0 border-b-[1cqh] border-l-[1cqh]",
          "bottom-0 right-0 border-b-[1cqh] border-r-[1cqh]",
        ].map((corner) => (
          <span key={corner} className={`absolute h-[9cqh] w-[9cqh] rounded-[1.5cqh] border-white/95 ${corner}`} />
        ))}
        <span className="absolute left-1/2 top-1/2 h-[4cqh] w-[4cqh] -translate-x-1/2 -translate-y-1/2 rounded-full border-[0.6cqh] border-white/90" />
      </span>
      <span className="wii-flash wii-ambient absolute inset-0 bg-white" />
    </>
  );
}

/** Guitar tuner and chords: a fretboard whose six strings vibrate, and a tuner needle
 *  settling into the green "in tune" zone. */
function MusicScene() {
  return (
    <>
      <span className="absolute inset-0 bg-gradient-to-b from-[#fff6f2] to-[#fde8e2]" />
      <span className="absolute inset-x-0 bg-gradient-to-b from-[#7a4a2c] to-[#5c361f] shadow-[0_1cqh_3cqh_rgb(0_0_0/0.25)]" style={{ top: "26cqh", height: "44cqh" }}>
        <span
          className="absolute inset-0"
          style={{ background: "repeating-linear-gradient(90deg, transparent 0 21cqh, #d9d3c7 21cqh 22cqh)", backgroundPosition: "calc(50% + 4cqh) 0" }}
        />
        {[-44, 0, 44].map((x) => (
          <span
            key={x}
            className="absolute h-[4cqh] w-[4cqh] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ left: `calc(50% + ${x - 7}cqh)`, top: "50%", background: "var(--tint)" }}
          />
        ))}
      </span>
      {/* Strings: thicker toward the bottom, each vibrating at its own rate */}
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <span
          key={index}
          className="wii-string wii-ambient absolute inset-x-0"
          style={{
            top: `${30 + index * 7.2}cqh`,
            height: `${0.5 + index * 0.18}cqh`,
            background: index < 3 ? "linear-gradient(#fdfaf2, #cfc6b4)" : "linear-gradient(#f0d9a8, #b8955a)",
            animationDuration: `${0.16 + index * 0.025}s`,
            animationDelay: `${-index * 0.05}s`,
          }}
        />
      ))}
      {/* Tuner */}
      <span className="absolute overflow-hidden rounded-full bg-white/90 shadow-[0_0.5cqh_1.5cqh_rgb(0_0_0/0.12)]" style={at(-36, 8, 72, 9)}>
        <span className="absolute inset-y-[2cqh] left-[calc(50%-5cqh)] w-[10cqh] rounded-full bg-[#3aa55d]/30" />
        {[-28, -14, 0, 14, 28].map((x) => (
          <span key={x} className="absolute top-[2.5cqh] h-[4cqh] w-[0.5cqh] bg-[#9ba0a7]" style={{ left: `calc(50% + ${x}cqh)` }} />
        ))}
        <span className="wii-needle wii-ambient absolute left-1/2 top-[1cqh] h-[7cqh] w-[0.9cqh] -translate-x-1/2 rounded-full" style={{ background: "var(--tint)" }} />
      </span>
    </>
  );
}

/** Darts scorer: a slowly turning board; a dart flies in and sticks every few seconds. */
const DART_SEGMENTS = 20;

function sector(r1: number, r2: number, a0: number, a1: number) {
  const point = (r: number, a: number) => `${(r * Math.cos(a)).toFixed(4)} ${(r * Math.sin(a)).toFixed(4)}`;
  return `M ${point(r1, a0)} L ${point(r2, a0)} A ${r2} ${r2} 0 0 1 ${point(r2, a1)} L ${point(r1, a1)} A ${r1} ${r1} 0 0 0 ${point(r1, a0)} Z`;
}

function Dartboard() {
  const rings: [number, number, "single" | "ring"][] = [
    [0.16, 0.56, "single"],
    [0.56, 0.62, "ring"],
    [0.62, 0.94, "single"],
    [0.94, 1, "ring"],
  ];
  const step = (Math.PI * 2) / DART_SEGMENTS;
  return (
    <svg viewBox="-1.2 -1.2 2.4 2.4" className="h-full w-full" aria-hidden="true">
      <circle r="1.2" fill="#1f2125" />
      {Array.from({ length: DART_SEGMENTS }, (_, index) => {
        const a0 = -Math.PI / 2 - step / 2 + index * step;
        return rings.map(([r1, r2, kind]) => (
          <path
            key={`${index}-${r1}`}
            d={sector(r1, r2, a0, a0 + step)}
            fill={kind === "single" ? (index % 2 ? "#f2e6c9" : "#1f2125") : index % 2 ? "#2f8f4e" : "#d23c3c"}
            stroke="#c9ccd1"
            strokeWidth="0.008"
          />
        ));
      })}
      <circle r="0.16" fill="#2f8f4e" />
      <circle r="0.07" fill="#d23c3c" />
    </svg>
  );
}

function DartsScene() {
  return (
    <>
      <span className="absolute inset-0 bg-gradient-to-b from-[#eef3f8] to-[#dfe7ef]" />
      <span className="absolute rounded-full bg-black/10" style={at(-25, 6, 92, 92)} />
      <span className="wii-spin-slow wii-ambient absolute" style={at(-28, 4, 92, 92)}>
        <Dartboard />
      </span>
      <span className="wii-impact wii-ambient absolute rounded-full border-[0.8cqh] border-white" style={at(5, 34, 12, 12)} />
      <span className="wii-dart wii-ambient absolute" style={at(10, 38, 34, 8)}>
        <svg viewBox="0 0 68 16" className="h-full w-full drop-shadow-[0_0.6cqh_0.6cqh_rgb(0_0_0/0.25)]" aria-hidden="true">
          <path d="M0 8 L10 6.5 L10 9.5 Z" fill="#9aa1aa" />
          <rect x="10" y="5.5" width="22" height="5" rx="2" fill="#c9ccd1" />
          <rect x="14" y="5.5" width="2" height="5" fill="#8a9099" />
          <rect x="19" y="5.5" width="2" height="5" fill="#8a9099" />
          <rect x="32" y="6.8" width="16" height="2.4" fill="#3d4148" />
          <path d="M48 8 L66 0 L62 8 L66 16 Z" style={{ fill: "var(--tint)" }} />
        </svg>
      </span>
      {/* Three throws per turn */}
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="wii-throw wii-ambient absolute rounded-full"
          style={{ ...at(34 + index * 7, 10, 4.5, 4.5), background: "var(--tint)", animationDelay: `${index * 1.6}s` }}
        />
      ))}
    </>
  );
}

/** AI and agents: a small neural network with pulses travelling along its links. */
const LAYERS = [
  [-48, [18, 36, 54]],
  [-16, [12, 28, 44, 60]],
  [16, [12, 28, 44, 60]],
  [48, [26, 46]],
] as const;

function NetworkScene() {
  const links: [number, number, number, number][] = [];
  for (let layer = 0; layer < LAYERS.length - 1; layer += 1) {
    const [x1, ys1] = LAYERS[layer];
    const [x2, ys2] = LAYERS[layer + 1];
    for (const y1 of ys1) for (const y2 of ys2) links.push([x1, y1, x2, y2]);
  }
  return (
    <>
      <span className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 40%, #ffffff, var(--tint-soft) 70%)" }} />
      <svg viewBox="-188.5 0 377 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {links.map(([x1, y1, x2, y2], index) => (
          <g key={index}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--tint)" strokeOpacity="0.18" strokeWidth="0.8" />
            {index % 3 === 0 && (
              <line
                className="wii-pulse-line wii-ambient"
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="var(--tint)"
                strokeWidth="1.4"
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray="8 92"
                style={{ animationDelay: `${(index % 7) * -0.4}s` }}
              />
            )}
          </g>
        ))}
        {LAYERS.flatMap(([x, ys], layer) =>
          ys.map((y, index) => (
            <circle
              key={`${x}-${y}`}
              className="wii-node wii-ambient"
              cx={x}
              cy={y}
              r={layer === 0 || layer === LAYERS.length - 1 ? 4 : 3.2}
              fill="#ffffff"
              stroke="var(--tint)"
              strokeWidth="1.4"
              style={{ animationDelay: `${layer * 0.35 + index * 0.1}s`, transformOrigin: `${x}px ${y}px` }}
            />
          )),
        )}
      </svg>
    </>
  );
}

/** Sandbox, building, and 3D games: an island in a bright sea, clouds drifting by. */
function IslandScene() {
  return (
    <>
      <span className="absolute inset-0 bg-gradient-to-b from-[#bfe7fb] via-[#e2f5fe] to-[#e9f8ff]" />
      <span className="absolute rounded-full bg-[#fff1a8] shadow-[0_0_6cqh_#fff3b8]" style={at(34, 8, 18, 18)} />
      <span className="wii-cloud wii-ambient absolute rounded-full bg-white" style={at(-70, 12, 24, 8)} />
      <span className="wii-cloud wii-cloud-slow wii-ambient absolute rounded-full bg-white/90" style={at(10, 22, 18, 6)} />
      <span className="absolute inset-x-0 bottom-0 h-[42cqh] overflow-hidden bg-gradient-to-b from-[#58c3e6] to-[#2b9fd2]">
        <span
          className="wii-waves wii-ambient absolute inset-y-0 -left-[20cqh] w-[calc(100%+40cqh)]"
          style={{ background: "repeating-linear-gradient(170deg, transparent 0 7cqh, rgb(255 255 255 / 0.28) 7cqh 8cqh)" }}
        />
      </span>
      <span className="absolute rounded-[50%] bg-[#f3dea0] shadow-[inset_0_-2cqh_0_#e2c47c]" style={at(-37, 54, 74, 16)} />
      <span className="absolute rounded-[50%] bg-[#7cc96b]" style={at(-23, 52, 46, 10)} />
      <span className="wii-sway wii-ambient absolute" style={at(-16, 22, 24, 32)}>
        <svg viewBox="0 0 40 50" className="h-full w-full" aria-hidden="true">
          <path d="M21 50 Q19 30 22 12" stroke="#8b5a2b" strokeWidth="3.4" fill="none" strokeLinecap="round" />
          <g fill="#3aa55d">
            <path d="M22 12 Q8 6 2 16 Q12 10 22 14 Z" />
            <path d="M22 12 Q36 4 40 16 Q30 9 22 14 Z" />
            <path d="M22 12 Q14 0 4 4 Q15 4 22 13 Z" />
            <path d="M22 12 Q30 -1 38 5 Q28 4 22 13 Z" />
          </g>
        </svg>
      </span>
    </>
  );
}

/** Other games: pixel hills scrolling past, coins bobbing, stars twinkling. */
function ArcadeScene() {
  return (
    <>
      <span className="absolute inset-0" style={{ background: "linear-gradient(to bottom, var(--tint-soft), #ffffff)" }} />
      {[
        [-52, 12, "0s"],
        [40, 9, "-1.2s"],
        [-26, 22, "-2.1s"],
        [52, 26, "-0.6s"],
      ].map(([x, y, delay]) => (
        <span
          key={`${x}${y}`}
          className="wii-twinkle wii-ambient absolute"
          style={{ ...at(Number(x), Number(y), 3, 3), background: "var(--tint)", animationDelay: String(delay) }}
        />
      ))}
      <span className="absolute inset-x-0 bottom-0 h-[44cqh] overflow-hidden">
        <span
          className="wii-scroll wii-ambient absolute inset-y-0 -left-[48cqh] w-[calc(100%+96cqh)]"
          style={{
            background:
              "linear-gradient(to top, color-mix(in srgb, var(--tint) 55%, white) 0 18cqh, transparent 18cqh) 0 0 / 48cqh 100%, repeating-linear-gradient(90deg, color-mix(in srgb, var(--tint) 35%, white) 0 12cqh, transparent 12cqh 24cqh) 0 100% / 48cqh 30cqh no-repeat",
          }}
        />
      </span>
      {[-30, -10, 10, 30].map((x, index) => (
        <span
          key={x}
          className="wii-bounce wii-ambient absolute rounded-[1cqh] bg-[#ffcf3f] shadow-[inset_-1cqh_-1cqh_0_#e0a91c]"
          style={{ ...at(x - 3, 36, 6, 6), animationDelay: `${index * -0.3}s` }}
        />
      ))}
    </>
  );
}

/** Web apps: calm geometric motion in the project's color, in one of three variants. */
function AppScene({ title }: SceneProps) {
  let hash = 0;
  for (const char of title) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const variant = hash % 3;
  return (
    <>
      <span className="absolute inset-0 bg-gradient-to-br from-white to-[var(--tint-soft)]" />
      <span
        className="wii-blob wii-ambient absolute rounded-full"
        style={{ ...at(-80, -20, 90, 90), background: "radial-gradient(circle, color-mix(in srgb, var(--tint) 30%, white), transparent 70%)" }}
      />
      <span
        className="wii-blob wii-blob-slow wii-ambient absolute rounded-full"
        style={{ ...at(10, 20, 100, 100), background: "radial-gradient(circle, color-mix(in srgb, var(--tint) 22%, white), transparent 70%)" }}
      />
      {variant === 0 &&
        // A grid of rounded squares that light up in a diagonal wave.
        Array.from({ length: 5 }, (_, row) =>
          Array.from({ length: 9 }, (_, column) => (
            <span
              key={`${row}-${column}`}
              className="wii-wave-tile wii-ambient absolute rounded-[2cqh]"
              style={{ ...at(-60 + column * 14, 4 + row * 14, 10, 10), background: "var(--tint)", animationDelay: `${(row + column) * 0.12}s` }}
            />
          )),
        )}
      {variant === 1 &&
        // Concentric rings expanding from the center.
        [0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className="wii-ring wii-ambient absolute rounded-full border-[0.8cqh]"
            style={{ ...at(-35, 2, 70, 70), borderColor: "var(--tint)", animationDelay: `${index * -1.1}s` }}
          />
        ))}
      {variant === 2 &&
        // Flowing diagonal lines.
        [0, 1, 2, 3, 4].map((index) => (
          <span
            key={index}
            className="wii-flow wii-ambient absolute rounded-full"
            style={{
              ...at(-80, 6 + index * 12, 160, 2),
              background: "linear-gradient(to right, transparent, var(--tint), transparent)",
              opacity: 0.25 + index * 0.08,
              animationDelay: `${index * -0.9}s`,
            }}
          />
        ))}
    </>
  );
}

// ---------------------------------------------------------------------------------------------
// Built-in channels

/** Projects: a fanned stack of miniature channel tiles, each showing a different project. */
function MiniTile({ children, style, delay }: { children: ReactNode; style: CSSProperties; delay: string }) {
  return (
    <span className="wii-float wii-ambient absolute" style={{ ...style, animationDelay: delay }}>
      <span className="absolute inset-0 overflow-hidden rounded-[3cqh] border-[0.8cqh] border-[#d3d7db] bg-white shadow-[0_1.2cqh_3cqh_rgb(30_40_60/0.18)]">
        <span className="absolute inset-[0.6cqh] overflow-hidden rounded-[2cqh]">{children}</span>
      </span>
    </span>
  );
}

function ProjectsScene() {
  return (
    <>
      <span className="absolute inset-0 bg-gradient-to-b from-[#e8f6fd] to-[#f7fbfe]" />
      <span
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "linear-gradient(to right, rgb(21 146 208 / 0.07) 1px, transparent 1px) 0 0 / 8cqh 8cqh, linear-gradient(to bottom, rgb(21 146 208 / 0.07) 1px, transparent 1px) 0 0 / 8cqh 8cqh",
        }}
      />
      <MiniTile style={{ ...at(-60, 16, 40, 30), rotate: "-9deg" }} delay="-1.2s">
        <span className="absolute inset-0" style={{ background: "repeating-conic-gradient(#c99c66 0 25%, #f7ecd6 0 50%) 0 0 / 7cqh 7cqh" }} />
      </MiniTile>
      <MiniTile style={{ ...at(22, 14, 40, 30), rotate: "8deg" }} delay="-2.4s">
        <span className="absolute inset-0 bg-gradient-to-b from-[#bfe7fb] to-[#e9f8ff]" />
        <span className="absolute inset-x-0 bottom-0 h-[40%] bg-[#4fbbe3]" />
        <span className="absolute bottom-[30%] left-[25%] h-[22%] w-[50%] rounded-[50%] bg-[#f3dea0]" />
        <span className="absolute bottom-[42%] left-[36%] h-[14%] w-[28%] rounded-[50%] bg-[#7cc96b]" />
      </MiniTile>
      <MiniTile style={at(-21, 8, 42, 32)} delay="0s">
        <span className="absolute inset-0 bg-[#7cc96b]" />
        <span className="absolute inset-[22%_14%] rounded-full border-[2.4cqh] border-[#61666f] shadow-[0_0_0_0.5cqh_#e94b4b,inset_0_0_0_0.5cqh_#ffffff]" />
        <span
          className="absolute left-[46%] top-[17%] h-[3.4cqh] w-[2cqh]"
          style={{ background: "repeating-conic-gradient(#1d2024 0 25%, #fff 0 50%) 0 0 / 1cqh 1cqh" }}
        />
      </MiniTile>
    </>
  );
}

/** GitHub: a contribution graph with cells lighting up, above a commit graph with a merge. */
const CONTRIBUTION_COLUMNS = 22;
const CONTRIBUTION_ROWS = 6;
const CONTRIBUTION_COLORS = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];

function GitHubScene() {
  const cells: ReactNode[] = [];
  for (let column = 0; column < CONTRIBUTION_COLUMNS; column += 1) {
    for (let row = 0; row < CONTRIBUTION_ROWS; row += 1) {
      // Deterministic pseudo-random activity, busier toward recent weeks.
      const seed = (column * 37 + row * 91 + column * row * 13) % 17;
      const level = Math.min(4, Math.max(0, Math.floor((seed + column / 3) / 4.2)));
      const pulse = (column * 7 + row * 3) % 11 === 0;
      cells.push(
        <span
          key={`${column}-${row}`}
          className={`absolute rounded-[0.6cqh] ${pulse ? "wii-cell wii-ambient" : ""}`}
          style={{
            ...at(-66 + column * 6, 8 + row * 6, 4.8, 4.8),
            background: CONTRIBUTION_COLORS[level],
            animationDelay: pulse ? `${(column % 5) * -0.6}s` : undefined,
          }}
        />,
      );
    }
  }
  return (
    <>
      <span className="absolute inset-0 bg-gradient-to-b from-[#f6f8fa] to-[#eaeef2]" />
      {cells}
      <span
        className="wii-sweep wii-ambient absolute"
        style={{ ...at(-70, 6, 14, 38), background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.75), transparent)" }}
      />
      {/* Commit graph: main line, a feature branch that merges back, and a commit travelling along main */}
      <svg viewBox="-188.5 0 377 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <line x1="-190" y1="58" x2="190" y2="58" stroke="#8c959f" strokeWidth="1.6" />
        <path d="M -40 58 C -30 58 -28 50 -18 50 L 16 50 C 26 50 28 58 38 58" fill="none" stroke="#bf8700" strokeWidth="1.6" />
        {[-60, -40, 38, 58].map((x) => (
          <circle key={x} cx={x} cy="58" r="2.4" fill="#ffffff" stroke="#57606a" strokeWidth="1.2" />
        ))}
        {[-6, 8].map((x) => (
          <circle key={x} cx={x} cy="50" r="2.4" fill="#ffffff" stroke="#bf8700" strokeWidth="1.2" />
        ))}
      </svg>
      <span className="wii-commit wii-ambient absolute rounded-full bg-[#2da44e] shadow-[0_0_2cqh_#2da44e]" style={at(-72, 56, 4, 4)} />
    </>
  );
}

/** About Me: the Mii, pre-rendered from the same 3D model as the About channel, waving hello. */
function AboutScene() {
  return (
    <>
      <span className="absolute inset-0 bg-gradient-to-b from-[#dff2fd] via-[#f4fbff] to-white" />
      <span
        className="absolute bottom-0 left-1/2 h-[90cqh] w-[340cqh] origin-bottom"
        style={{
          transform: "translateX(-50%) perspective(150cqh) rotateX(62deg)",
          background:
            "linear-gradient(to right, #dfe3e8 0.25cqh, transparent 0.25cqh) 0 0 / 12cqh 12cqh, linear-gradient(to bottom, #dfe3e8 0.25cqh, #f6f7f9 0.25cqh) 0 0 / 12cqh 12cqh",
        }}
      />
      <span className="wii-bounce wii-ambient absolute" style={at(-40, 6, 60, 70)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/models/mii/wave-a.png" alt="" draggable={false} className="absolute inset-0 h-full w-full object-contain" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/models/mii/wave-b.png"
          alt=""
          draggable={false}
          className="wii-wave-frame wii-ambient absolute inset-0 h-full w-full object-contain"
        />
      </span>
      <span className="wii-pop wii-ambient absolute" style={at(16, 12, 34, 20)}>
        <span className="absolute -left-[1.6cqh] bottom-[3cqh] h-[4cqh] w-[4cqh] rotate-45 bg-white" />
        <span className="absolute inset-0 flex items-center justify-center rounded-[5cqh] bg-white text-[10cqh] font-extrabold text-wii-blue shadow-[0_0.8cqh_2.4cqh_rgb(30_40_60/0.14)] ring-1 ring-black/5">
          Hi!
        </span>
      </span>
    </>
  );
}

/** LinkedIn: a profile card at the center of a small professional network. */
const LINKEDIN_BLUE = "#0a66c2";
const CONNECTIONS: [number, number][] = [
  [-62, 14],
  [-66, 46],
  [-38, 60],
  [44, 12],
  [58, 40],
  [36, 60],
];

function LinkedInScene() {
  return (
    <>
      <span className="absolute inset-0 bg-gradient-to-br from-[#eef5fb] to-[#dbe9f6]" />
      <svg viewBox="-188.5 0 377 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {CONNECTIONS.map(([x, y], index) => (
          <g key={index}>
            <line x1={x} y1={y} x2="0" y2="34" stroke={LINKEDIN_BLUE} strokeOpacity="0.2" strokeWidth="0.8" />
            <line
              className="wii-pulse-line wii-ambient"
              x1={x}
              y1={y}
              x2="0"
              y2="34"
              stroke={LINKEDIN_BLUE}
              strokeWidth="1.4"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray="10 90"
              style={{ animationDelay: `${index * -0.5}s` }}
            />
          </g>
        ))}
      </svg>
      {CONNECTIONS.map(([x, y], index) => (
        <span
          key={index}
          className="wii-bounce wii-ambient absolute rounded-full border-[0.7cqh] border-white shadow-[0_0.6cqh_1.6cqh_rgb(10_102_194/0.25)]"
          style={{ ...at(x - 4.5, y - 4.5, 9, 9), background: index % 2 ? "#70b5f9" : "#378fe9", animationDelay: `${index * -0.35}s` }}
        />
      ))}
      {/* Profile card */}
      <span
        className="absolute overflow-hidden rounded-[3cqh] bg-white shadow-[0_1.4cqh_4cqh_rgb(10_60_120/0.2)] ring-1 ring-black/5"
        style={at(-24, 10, 48, 50)}
      >
        <span className="absolute inset-x-0 top-0 h-[12cqh]" style={{ background: `linear-gradient(120deg, ${LINKEDIN_BLUE}, #378fe9)` }} />
        <span className="absolute left-[4cqh] top-[5cqh] h-[14cqh] w-[14cqh] overflow-hidden rounded-full border-[0.8cqh] border-white bg-[#e8f3fc]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/models/mii/wave-a.png"
            alt=""
            draggable={false}
            className="absolute left-1/2 top-[-6%] h-[230%] max-w-none -translate-x-[46%]"
          />
        </span>
        <span className="absolute left-[4cqh] top-[22cqh] h-[3cqh] w-[28cqh] rounded-full bg-[#1d2226]/80" />
        <span className="absolute left-[4cqh] top-[27.5cqh] h-[2.2cqh] w-[36cqh] rounded-full bg-[#1d2226]/25" />
        <span className="absolute left-[4cqh] top-[32cqh] h-[2.2cqh] w-[22cqh] rounded-full bg-[#1d2226]/25" />
        <span
          className="wii-connect wii-ambient absolute left-[4cqh] top-[38cqh] h-[6cqh] w-[18cqh] rounded-full"
          style={{ background: LINKEDIN_BLUE }}
        />
      </span>
    </>
  );
}

/** Contact: an envelope whose letter slides in and out, and a paper plane gliding along a trail. */
function ContactScene() {
  return (
    <>
      <span className="absolute inset-0 bg-gradient-to-b from-[#e7f4fc] to-[#f9fcfe]" />
      <svg viewBox="-188.5 0 377 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path
          d="M -120 54 C -70 20 -20 70 30 26 S 110 14 160 30"
          fill="none"
          stroke="#1592d0"
          strokeOpacity="0.35"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      </svg>
      <span className="wii-plane wii-ambient absolute" style={at(-80, 30, 12, 12)}>
        <svg viewBox="0 0 24 24" className="h-full w-full drop-shadow-[0_0.6cqh_0.8cqh_rgb(21_146_208/0.3)]" aria-hidden="true">
          <path d="M2 11 L22 3 L15 21 L11 13 Z" fill="#ffffff" stroke="#1592d0" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M11 13 L22 3" stroke="#1592d0" strokeWidth="1.2" />
        </svg>
      </span>
      {/* Envelope */}
      <span className="absolute" style={at(-30, 22, 50, 38)}>
        <span className="wii-letter wii-ambient absolute left-[10%] top-[8%] h-[70%] w-[80%] rounded-[1.5cqh] bg-white shadow-[0_0.4cqh_1cqh_rgb(0_0_0/0.1)]">
          <span className="absolute left-[12%] top-[16%] h-[8%] w-[60%] rounded-full bg-[#1592d0]/60" />
          <span className="absolute left-[12%] top-[34%] h-[6%] w-[74%] rounded-full bg-[#c3c8cd]" />
          <span className="absolute left-[12%] top-[48%] h-[6%] w-[52%] rounded-full bg-[#c3c8cd]" />
        </span>
        <svg
          viewBox="0 0 100 76"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-[76%] w-full drop-shadow-[0_1cqh_2cqh_rgb(30_40_60/0.18)]"
          aria-hidden="true"
        >
          <path d="M0 6 L50 44 L100 6 L100 76 L0 76 Z" fill="#ffffff" stroke="#c9d6e0" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M0 76 L42 38 M100 76 L58 38" stroke="#dbe4ec" strokeWidth="1.2" />
        </svg>
        <span className="wii-notify wii-ambient absolute -right-[2cqh] top-[18%] h-[8cqh] w-[8cqh] rounded-full border-[0.8cqh] border-white bg-[#e5484d]" />
      </span>
    </>
  );
}

const SCENES: Record<ChannelScene, (props: SceneProps) => ReactNode> = {
  board: BoardScene,
  race: RaceScene,
  road: RoadScene,
  music: MusicScene,
  darts: DartsScene,
  network: NetworkScene,
  island: IslandScene,
  arcade: ArcadeScene,
  app: AppScene,
  projects: ProjectsScene,
  github: GitHubScene,
  about: AboutScene,
  linkedin: LinkedInScene,
  contact: ContactScene,
};
