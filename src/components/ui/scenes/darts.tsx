import { at } from "@/components/ui/scenes/shared";

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

export function DartsScene() {
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
