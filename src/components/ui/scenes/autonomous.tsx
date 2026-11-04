import { MotionGate } from "@/components/ui/MotionGate";

/** Self-driving cars: a top-down circuit, a faint population of cars behind a leader whose sensor rays fan out ahead. */
const TRACK = "M -60 30 Q -60 18 -46 18 L 40 18 A 28 28 0 0 1 40 74 L -10 74 Q -24 74 -30 62 Q -36 50 -52 52 Q -60 52 -60 42 Z";
const RAYS = [-60, -30, 0, 30, 60];

function Car({ color, rays = false, opacity = 1 }: { color: string; rays?: boolean; opacity?: number }) {
  return (
    <g opacity={opacity}>
      {rays &&
        RAYS.map((angle) => (
          <g key={angle} transform={`rotate(${angle})`}>
            <line x1="3.4" y1="0" x2={angle === 0 ? 22 : 15} y2="0" stroke="#ffd25a" strokeWidth="0.55" strokeLinecap="round" strokeDasharray="1.6 1.2" />
            <circle cx={angle === 0 ? 22 : 15} cy="0" r="0.9" fill="#ffd25a" />
          </g>
        ))}
      <rect x="-3.8" y="-2.2" width="7.6" height="4.4" rx="1.6" fill={color} stroke="#1d2024" strokeWidth="0.6" />
      <rect x="0.4" y="-1.5" width="2" height="3" rx="0.6" fill="#cfe9ff" />
    </g>
  );
}

export function AutonomousScene() {
  const lap = (key: string, color: string, seconds: number, begin: number, rays = false, opacity = 1) => (
    <g key={key}>
      <Car color={color} rays={rays} opacity={opacity} />
      <animateMotion dur={`${seconds}s`} begin={`${begin}s`} repeatCount="indefinite" rotate="auto" path={TRACK} />
    </g>
  );
  return (
    <>
      <span className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 35%, #2f3a4d, #151a24 78%)" }} />
      <span
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgb(255 255 255 / 0.07) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.07) 1px, transparent 1px)",
          backgroundSize: "8cqh 8cqh",
        }}
      />
      <svg viewBox="-188.5 0 377 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path d={TRACK} fill="none" stroke="#e9edf3" strokeWidth="17" strokeLinejoin="round" opacity="0.9" />
        <path d={TRACK} fill="none" stroke="#3b4150" strokeWidth="14.6" strokeLinejoin="round" />
        <path d={TRACK} fill="none" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="0.7" strokeDasharray="4 5" />
        {/* Start line */}
        {Array.from({ length: 6 }, (_, index) => (
          <rect key={index} x={-8 + (index % 2) * 2} y={11 + Math.floor(index / 2) * 2.4} width="2" height="2.4" fill={(index + Math.floor(index / 2)) % 2 ? "#ffffff" : "#1d2024"} />
        ))}
        {/* A small network, the "brain" of the leader */}
        <g transform="translate(-4 40)" opacity="0.95">
          {[
            [-14, [-8, 0, 8]],
            [0, [-12, -4, 4, 12]],
            [14, [-4, 4]],
          ].flatMap(([x, ys], layer, all) =>
            (ys as number[]).flatMap((y) => {
              const next = all[layer + 1];
              if (!next) return [];
              return (next[1] as number[]).map((y2) => (
                <line key={`${x}-${y}-${y2}`} x1={x as number} y1={y} x2={next[0] as number} y2={y2} stroke="var(--tint)" strokeOpacity="0.5" strokeWidth="0.4" />
              ));
            }),
          )}
          {[
            [-14, [-8, 0, 8]],
            [0, [-12, -4, 4, 12]],
            [14, [-4, 4]],
          ].flatMap(([x, ys]) => (ys as number[]).map((y) => <circle key={`${x}${y}`} cx={x as number} cy={y} r="1.7" fill="#151a24" stroke="var(--tint)" strokeWidth="0.7" />))}
        </g>
        <MotionGate
          animated={
            <>
              {lap("g1", "#7d8798", 9, -1.4, false, 0.5)}
              {lap("g2", "#7d8798", 9.4, -3.2, false, 0.5)}
              {lap("g3", "#7d8798", 8.8, -5.6, false, 0.5)}
              {lap("lead", "var(--tint)", 8, 0, true)}
            </>
          }
          still={
            <>
              <g transform="translate(-34 18)">
                <Car color="#7d8798" opacity={0.5} />
              </g>
              <g transform="translate(14 18)">
                <Car color="var(--tint)" rays />
              </g>
            </>
          }
        />
      </svg>
    </>
  );
}
