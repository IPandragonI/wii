import { at } from "@/components/ui/scenes/shared";

/**
 * Atlas: a flat world map (planisphere) centered in the banner. Like the Voyo scene, the route
 * is drawn live: it traces from A, each country on the way pops in as the line reaches it, then
 * the B pin drops and pings before everything fades and starts over.
 * Palette: #243B35 / #526B5D / #D8D1BD / #F3F0E7 / #303638.
 * Coordinates are equirectangular on a 200 x 100 canvas, so x = (lon + 180) / 1.8 and y = (90 - lat) / 1.8.
 */
const LANDMASSES = [
  // North America
  "M6.7 13.3 L22 11 L47 10 L55.6 15 L65.6 17.8 L69.4 22 L61 26 L57.8 30.6 L55 36 L50 33.9 L46 35.6 L47 40 L53.5 44 L57 45.6 L55 46 L51 44 L46 41.5 L41.7 38.3 L38.9 36.7 L35 32 L31 27.8 L30.6 22.8 L25 17.8 L16.7 16.7 L8.3 16.7 Z",
  // Greenland
  "M67 6 L78 3.5 L89 5 L84 12 L75 16 L69 13 Z",
  // South America
  "M57.2 45.6 L66.7 44.4 L72.2 50 L80.6 53.3 L77.8 62.2 L73.3 65.6 L67.8 71.1 L63.9 75 L62.2 80 L58.9 77.8 L59.4 71.1 L60.6 60 L55 52.8 L55.6 48.9 Z",
  // Europe and Asia
  "M94.4 30 L95 26 L99 23.3 L103 21 L105.6 19.4 L103 16.7 L106 14.4 L111 11 L117 10.6 L142 7 L160 8 L195 11 L196 17 L190 22 L183 25 L178 25 L170 30.6 L166.7 36 L160 43 L156 48 L152 44 L147 41 L144.4 41.7 L143 45.5 L140.6 38.9 L137.8 36.7 L131 35.6 L132.8 37.8 L125 42.8 L121.7 38.3 L118.3 33.3 L119.4 30 L112 29.4 L108 28 L100 28.5 Z",
  // Africa
  "M96.7 30.3 L105.6 29.4 L117.8 32.8 L123.9 43.3 L128.3 43.3 L122 51.7 L122 58.3 L118.3 64.4 L111 69.4 L108 65 L106.7 58.3 L105 50.6 L104.4 47.8 L95.6 47.5 L90.6 42.2 L91.5 35 Z",
  // Madagascar, Indonesia, Australia, New Zealand
  "M125 56 L127.5 58 L126.5 64 L124.5 62 Z",
  "M157 49 L166 50 L164 52 L158 51.5 Z",
  "M168 49 L180 50.5 L178 53 L170 52 Z",
  "M163 61 L168 56 L176 54 L182 58 L185 64 L180 70 L172 70 L165 67 Z",
  "M191 70 L193.5 72 L192 76 L190 74 Z",
];

/** Spain -> Germany -> Poland -> Turkey -> Iran -> India. */
const ROUTE = "M98 27 L103.5 23.5 L111 22 L120 27 L131 32 L142 37";
/** Countries along the way, each popping in (class wii-stop-N) as the traced line reaches it. */
const STOPS: [number, number][] = [
  [103.5, 23.5],
  [111, 22],
  [120, 27],
  [131, 32],
];

function Pin({ label, x, y, fill, className }: { label: string; x: number; y: number; fill: string; className: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(1.35)`}>
      <g className={`${className} wii-ambient`}>
        <path d="M0 0 l-4.2 -8 a5 5 0 1 1 8.4 0 Z" fill={fill} stroke="#F3F0E7" strokeWidth="0.9" strokeLinejoin="round" />
        <text x="0" y="-8" textAnchor="middle" fontSize="5.2" fontWeight="800" fill="#F3F0E7" fontFamily="system-ui, sans-serif">
          {label}
        </text>
      </g>
    </g>
  );
}

export function PlanisphereScene() {
  return (
    <>
      <span className="absolute inset-0" style={{ background: "linear-gradient(170deg, #243B35, #303638)" }} />
      {/* The map is centered horizontally and vertically (its land spans about y 4 to 76 of 100). */}
      <span className="absolute" style={at(-75, 20, 150, 75)}>
        <svg viewBox="0 0 200 100" className="h-full w-full overflow-visible" aria-hidden="true">
          {/* Graticule, running past the map so it fills wide banners */}
          <g stroke="#526B5D" strokeOpacity="0.5" strokeWidth="0.3">
            {Array.from({ length: 23 }, (_, index) => (
              <line key={`m${index}`} x1={-120 + index * 20} y1="-60" x2={-120 + index * 20} y2="160" />
            ))}
            {Array.from({ length: 11 }, (_, index) => (
              <line
                key={`p${index}`}
                x1="-120"
                y1={-40 + index * 20}
                x2="320"
                y2={-40 + index * 20}
                strokeOpacity={index === 4 ? 0.9 : 0.5}
                strokeDasharray={index === 4 ? "2 1.4" : undefined}
              />
            ))}
          </g>
          {/* Land */}
          {LANDMASSES.map((d) => (
            <path key={d} d={d} fill="#D8D1BD" stroke="#F3F0E7" strokeOpacity="0.6" strokeWidth="0.4" strokeLinejoin="round" />
          ))}

          {/* The route, traced from A to B */}
          <path d={ROUTE} fill="none" stroke="#303638" strokeOpacity="0.6" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" pathLength="100" strokeDasharray="100" className="wii-trace wii-ambient" />
          <path d={ROUTE} fill="none" stroke="#F3F0E7" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" pathLength="100" strokeDasharray="100" className="wii-trace wii-ambient" />

          {STOPS.map(([x, y], index) => (
            <circle
              key={`${x}${y}`}
              cx={x}
              cy={y}
              r="2"
              fill="#F3F0E7"
              stroke="#526B5D"
              strokeWidth="1.1"
              className={`wii-stop-${index + 1} wii-ambient`}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
            />
          ))}

          <Pin label="A" x={98} y={27} fill="#526B5D" className="wii-pin-a" />
          <circle cx="142" cy="37" r="3.6" fill="none" stroke="#F3F0E7" strokeWidth="0.7" className="wii-ping wii-ambient" style={{ transformBox: "fill-box", transformOrigin: "center" }} />
          <Pin label="B" x={142} y={37} fill="#303638" className="wii-pin-b" />
        </svg>
      </span>
    </>
  );
}
