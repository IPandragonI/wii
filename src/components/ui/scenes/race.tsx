import { MotionGate } from "@/components/ui/MotionGate";

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

export function RaceScene() {
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
