import type { ReactNode } from "react";
import { at } from "@/components/ui/scenes/shared";

/** GitHub: a contribution graph with cells lighting up, above a commit graph with a merge. */
const CONTRIBUTION_COLUMNS = 22;
const CONTRIBUTION_ROWS = 6;
const CONTRIBUTION_COLORS = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];

export function GitHubScene() {
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
