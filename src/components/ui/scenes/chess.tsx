import type { CSSProperties } from "react";
import { at } from "@/components/ui/scenes/shared";

/** Chess analysis: a board in perspective, a knight hopping between squares, a best-move
 *  arrow, and an evaluation bar that leans one way and then the other. */
export function BoardScene() {
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
