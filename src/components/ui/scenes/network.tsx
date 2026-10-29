/** AI and agents: a small neural network with pulses travelling along its links. */
const LAYERS = [
  [-48, [18, 36, 54]],
  [-16, [12, 28, 44, 60]],
  [16, [12, 28, 44, 60]],
  [48, [26, 46]],
] as const;

export function NetworkScene() {
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
