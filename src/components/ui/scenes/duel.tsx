import type { CSSProperties } from "react";

import { at } from "@/components/ui/scenes/shared";

/**
 * Checkmate: an online chess duel, shown as a back-rank mate on a flat, top-down green board.
 * A white rook slides along the eighth rank, the squares it moved between light up, the black
 * king's square flashes red, and the king topples. Deliberately unlike the analysis scene: no
 * perspective, no cream figurines, no evaluation bar.
 */

const SQUARE = 20;
const COLUMNS = 8;
const ROWS = 5;
/** Board left edge, in cqh from the center, so the squares sit symmetrically. */
const LEFT = -(COLUMNS * SQUARE) / 2;

const square = (column: number, row: number, extra?: CSSProperties) => at(LEFT + column * SQUARE, row * SQUARE, SQUARE, SQUARE, extra);

export function DuelScene() {
  return (
    <>
      <span className="absolute inset-0 bg-[#e9efe0]" />
      <span
        className="absolute"
        style={{
          ...at(LEFT, 0, COLUMNS * SQUARE, ROWS * SQUARE),
          background: `repeating-conic-gradient(#769656 0 25%, #eeeed2 0 50%) 0 0 / ${SQUARE * 2}cqh ${SQUARE * 2}cqh`,
        }}
      />
      <span className="absolute inset-0 shadow-[inset_0_0_14cqh_rgb(20_40_20/0.35)]" />

      {/* The rook's last move: origin and destination squares light up, like an analysis board. */}
      <span className="wii-mate-from wii-ambient absolute bg-[#f6f669]/55" style={square(0, 1)} />
      <span className="wii-mate-to wii-ambient absolute bg-[#f6f669]/55" style={square(3, 1)} />

      {/* Check: the king's square glows red and pulses. */}
      <span
        className="wii-mate-check wii-ambient absolute"
        style={square(5, 1, { background: "radial-gradient(circle, rgb(235 60 60 / 0.95) 0%, rgb(235 60 60 / 0.55) 45%, transparent 75%)" })}
      />

      {/* Black pawns shelter the king: f7, g7 and h7 in front of the back rank. */}
      {[4, 5, 6].map((column) => (
        <Piece key={column} kind="pawn" style={square(column, 2)} />
      ))}
      <span className="wii-mate-king wii-ambient absolute" style={square(5, 1)}>
        <Piece kind="king" style={{ position: "absolute", inset: 0 }} />
      </span>

      {/* The white rook slides in and delivers mate. */}
      <span className="wii-mate-rook wii-ambient absolute" style={square(3, 1)}>
        <Piece kind="rook" light style={{ position: "absolute", inset: 0 }} />
      </span>
    </>
  );
}

function Piece({ kind, light = false, style }: { kind: "king" | "rook" | "pawn"; light?: boolean; style: CSSProperties }) {
  const fill = light ? "#fbfbf8" : "#1c2530";
  const stroke = light ? "#1c2530" : "#0d131a";
  return (
    <svg viewBox="0 0 20 20" className="absolute drop-shadow-[0_0.5cqh_0.4cqh_rgb(0_0_0/0.3)]" style={style} aria-hidden="true">
      <g fill={fill} stroke={stroke} strokeWidth="0.7" strokeLinejoin="round">
        {kind === "king" && (
          <>
            <path d="M9.2 2 h1.6 v1.6 h1.6 v1.5 h-1.6 v1.5 h-1.6 v-1.5 h-1.6 v-1.5 h1.6 Z" />
            <path d="M5.2 15.8 C5.4 11.4 6.6 8.6 10 7.4 C13.4 8.6 14.6 11.4 14.8 15.8 Z" />
            <rect x="4.2" y="15.8" width="11.6" height="2.4" rx="1.2" />
          </>
        )}
        {kind === "rook" && (
          <>
            <path d="M5.8 3.4 h2 v1.6 h1.4 V3.4 h1.6 v1.6 h1.4 V3.4 h2 v4 H5.8 Z" />
            <path d="M6.8 7.4 h6.4 l.8 8.4 H6 Z" />
            <rect x="4.6" y="15.8" width="10.8" height="2.4" rx="1.1" />
          </>
        )}
        {kind === "pawn" && (
          <>
            <circle cx="10" cy="7.4" r="2.6" />
            <path d="M7.8 10.2 C8.6 9.8 11.4 9.8 12.2 10.2 L13.4 15.8 H6.6 Z" />
            <rect x="5.4" y="15.8" width="9.2" height="2.2" rx="1.1" />
          </>
        )}
      </g>
    </svg>
  );
}
