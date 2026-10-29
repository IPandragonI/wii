import type { CSSProperties } from "react";

/**
 * An original Mii-style character: oversized round head, simple features, brown hair, and a
 * small body in a "favorite color" shirt. Drawn as SVG so it stays crisp at any size.
 * It blinks and breathes gently; both stop under reduced motion.
 */

const SKIN = "#f7d3b2";
const SKIN_SHADE = "#e8b994";
const HAIR = "#6b4324";
const HAIR_SHADE = "#55341b";
export const MII_FAVORITE_COLOR = "#2d8fd5";

function Head() {
  return (
    <g>
      {/* Ears and face */}
      <ellipse cx="49" cy="102" rx="9" ry="12" fill={SKIN} stroke={SKIN_SHADE} strokeWidth="1.5" />
      <ellipse cx="151" cy="102" rx="9" ry="12" fill={SKIN} stroke={SKIN_SHADE} strokeWidth="1.5" />
      <ellipse cx="100" cy="98" rx="51" ry="56" fill={SKIN} stroke={SKIN_SHADE} strokeWidth="1.5" />

      {/* Hair: a rounded cap with a side-swept fringe and short sideburns */}
      <path
        d="M47 100 C40 52 68 32 101 32 C134 32 162 52 153 100 C150 84 146 74 138 66 C126 76 100 80 74 70 C62 76 52 86 47 100 Z"
        fill={HAIR}
      />
      <path d="M74 70 C92 78 116 76 138 66 C124 54 96 52 74 70 Z" fill={HAIR_SHADE} opacity="0.55" />
      <path d="M48 96 L56 96 L55 112 L49 110 Z" fill={HAIR} />
      <path d="M152 96 L144 96 L145 112 L151 110 Z" fill={HAIR} />

      {/* Eyebrows */}
      <path d="M70 86 Q80 80 91 85" stroke={HAIR_SHADE} strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <path d="M109 85 Q120 80 130 86" stroke={HAIR_SHADE} strokeWidth="4.5" strokeLinecap="round" fill="none" />

      {/* Eyes (blink together) */}
      <g className="mii-blink">
        <ellipse cx="81" cy="102" rx="5.5" ry="8" fill="#2a2a2e" />
        <ellipse cx="119" cy="102" rx="5.5" ry="8" fill="#2a2a2e" />
        <circle cx="83" cy="98.5" r="1.9" fill="#fff" />
        <circle cx="121" cy="98.5" r="1.9" fill="#fff" />
      </g>

      {/* Nose and smile */}
      <path d="M100 109 Q105 117 99 120" stroke="#d49a72" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M86 129 Q100 143 114 129 Q100 135 86 129 Z" fill="#c4553f" stroke="#a9432f" strokeWidth="1.5" strokeLinejoin="round" />
    </g>
  );
}

interface MiiProps {
  className?: string;
  style?: CSSProperties;
  /** Accessible name; omit for a decorative character. */
  label?: string;
}

/** The full standing character. */
export function MiiAvatar({ className, style, label }: MiiProps) {
  return (
    <svg
      viewBox="0 0 200 300"
      className={className}
      style={style}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <ellipse cx="100" cy="289" rx="44" ry="7" fill="#000" opacity="0.12" />
      <g className="mii-breathe">
        {/* Legs and shoes */}
        <rect x="80" y="222" width="17" height="58" rx="8" fill="#4b5563" />
        <rect x="103" y="222" width="17" height="58" rx="8" fill="#4b5563" />
        <ellipse cx="88" cy="281" rx="13" ry="6" fill="#2f3640" />
        <ellipse cx="112" cy="281" rx="13" ry="6" fill="#2f3640" />

        {/* Arms and hands */}
        <path d="M74 166 Q60 188 58 214" stroke={MII_FAVORITE_COLOR} strokeWidth="15" strokeLinecap="round" fill="none" />
        <path d="M126 166 Q140 188 142 214" stroke={MII_FAVORITE_COLOR} strokeWidth="15" strokeLinecap="round" fill="none" />
        <circle cx="58" cy="219" r="8.5" fill={SKIN} stroke={SKIN_SHADE} strokeWidth="1.5" />
        <circle cx="142" cy="219" r="8.5" fill={SKIN} stroke={SKIN_SHADE} strokeWidth="1.5" />

        {/* Shirt */}
        <path d="M70 160 Q100 150 130 160 L137 229 Q100 239 63 229 Z" fill={MII_FAVORITE_COLOR} />
        <path d="M66 205 Q100 214 134 205 L137 229 Q100 239 63 229 Z" fill="#000" opacity="0.08" />
        <path d="M89 153 Q100 166 111 153" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* Neck and head */}
        <rect x="92" y="142" width="16" height="16" rx="4" fill={SKIN} />
        <Head />
      </g>
    </svg>
  );
}

/** Just the head, used as the About channel's emblem. Accepts icon-like props. */
export function MiiFace({ className, size }: { className?: string; size?: number | string }) {
  return (
    <svg viewBox="36 28 128 130" width={size} height={size} className={className} aria-hidden="true">
      <Head />
    </svg>
  );
}
