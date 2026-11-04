import { at } from "@/components/ui/scenes/shared";

/** Career guidance: a compass whose needle searches then settles on north, with a path of milestones climbing beside it. */
const MILESTONES: [number, number][] = [
  [6, 82],
  [20, 66],
  [36, 56],
  [50, 38],
  [62, 20],
];

export function CompassScene() {
  const path = MILESTONES.map(([x, y], index) => `${index ? "L" : "M"} ${x} ${y}`).join(" ");
  return (
    <>
      <span className="absolute inset-0" style={{ background: "linear-gradient(160deg, #fff6e0, var(--tint-soft) 85%)" }} />
      <span className="wii-blob wii-ambient absolute rounded-full opacity-40 blur-[3cqh]" style={{ ...at(-60, -10, 60, 60), background: "var(--tint-soft)" }} />

      {/* The route: dashed path with a flag at each step, the last one lit */}
      <svg viewBox="-188.5 0 377 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <g transform="translate(8 0)">
          <path d={path} fill="none" stroke="var(--tint)" strokeOpacity="0.55" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 3.4" className="wii-dash wii-ambient" />
          {MILESTONES.map(([x, y], index) => {
            const last = index === MILESTONES.length - 1;
            return (
              <g key={`${x}${y}`}>
                <circle cx={x} cy={y} r={last ? 3.6 : 2.6} fill="#ffffff" stroke="var(--tint)" strokeWidth="1.2" className={last ? "wii-node wii-ambient" : undefined} style={last ? { transformOrigin: `${x}px ${y}px` } : undefined} />
                {last && (
                  <>
                    <line x1={x} y1={y - 3.6} x2={x} y2={y - 11} stroke="#4b3a2a" strokeWidth="0.8" strokeLinecap="round" />
                    <path d={`M ${x} ${y - 11} L ${x + 8} ${y - 8.5} L ${x} ${y - 6} Z`} fill="var(--tint)" />
                  </>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Compass */}
      <span className="absolute rounded-full bg-black/10 blur-[0.6cqh]" style={at(-52, 21, 70, 70)} />
      <span className="absolute" style={at(-54, 18, 70, 70)}>
        <svg viewBox="-50 -50 100 100" className="h-full w-full" aria-hidden="true">
          <circle r="48" fill="#e6c36a" stroke="#b0892f" strokeWidth="2" />
          <circle r="42" fill="#fffaf0" stroke="#b0892f" strokeWidth="1" />
          {Array.from({ length: 36 }, (_, index) => (
            <line key={index} y1="-42" y2={index % 9 === 0 ? -33 : index % 3 === 0 ? -37 : -39.5} stroke="#6a5a3c" strokeWidth={index % 9 === 0 ? 1.4 : 0.6} transform={`rotate(${index * 10})`} />
          ))}
          {([
            ["N", 0, -23],
            ["E", 23, 3.5],
            ["S", 0, 29.5],
            ["W", -23, 3.5],
          ] as const).map(([label, x, y]) => (
            <text key={label} x={x} y={y} textAnchor="middle" fontSize="10" fontWeight="700" fill={label === "N" ? "var(--tint)" : "#6a5a3c"} fontFamily="system-ui, sans-serif">
              {label}
            </text>
          ))}
        </svg>
        <span className="wii-compass wii-ambient absolute inset-0 block">
          <svg viewBox="-50 -50 100 100" className="h-full w-full" aria-hidden="true">
            <path d="M 0 -34 L 5.5 0 L -5.5 0 Z" fill="var(--tint)" />
            <path d="M 0 34 L 5.5 0 L -5.5 0 Z" fill="#6a5a3c" />
            <circle r="3.2" fill="#fffaf0" stroke="#6a5a3c" strokeWidth="1" />
          </svg>
        </span>
      </span>
    </>
  );
}
