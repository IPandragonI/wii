import { at } from "@/components/ui/scenes/shared";

/** LinkedIn: a profile card at the center of a small professional network. */
const LINKEDIN_BLUE = "#0a66c2";
const CONNECTIONS: [number, number][] = [
  [-62, 14],
  [-66, 46],
  [-38, 60],
  [44, 12],
  [58, 40],
  [36, 60],
];

export function LinkedInScene() {
  return (
    <>
      <span className="absolute inset-0 bg-gradient-to-br from-[#eef5fb] to-[#dbe9f6]" />
      <svg viewBox="-188.5 0 377 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {CONNECTIONS.map(([x, y], index) => (
          <g key={index}>
            <line x1={x} y1={y} x2="0" y2="34" stroke={LINKEDIN_BLUE} strokeOpacity="0.2" strokeWidth="0.8" />
            <line
              className="wii-pulse-line wii-ambient"
              x1={x}
              y1={y}
              x2="0"
              y2="34"
              stroke={LINKEDIN_BLUE}
              strokeWidth="1.4"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray="10 90"
              style={{ animationDelay: `${index * -0.5}s` }}
            />
          </g>
        ))}
      </svg>
      {CONNECTIONS.map(([x, y], index) => (
        <span
          key={index}
          className="wii-bounce wii-ambient absolute rounded-full border-[0.7cqh] border-white shadow-[0_0.6cqh_1.6cqh_rgb(10_102_194/0.25)]"
          style={{ ...at(x - 4.5, y - 4.5, 9, 9), background: index % 2 ? "#70b5f9" : "#378fe9", animationDelay: `${index * -0.35}s` }}
        />
      ))}
      {/* Profile card */}
      <span
        className="absolute overflow-hidden rounded-[3cqh] bg-white shadow-[0_1.4cqh_4cqh_rgb(10_60_120/0.2)] ring-1 ring-black/5"
        style={at(-24, 10, 48, 50)}
      >
        <span className="absolute inset-x-0 top-0 h-[12cqh]" style={{ background: `linear-gradient(120deg, ${LINKEDIN_BLUE}, #378fe9)` }} />
        <span className="absolute left-[4cqh] top-[5cqh] h-[14cqh] w-[14cqh] overflow-hidden rounded-full border-[0.8cqh] border-white bg-[#e8f3fc]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/models/mii/wave-a.png"
            alt=""
            draggable={false}
            className="absolute left-1/2 top-[-6%] h-[230%] max-w-none -translate-x-[46%]"
          />
        </span>
        <span className="absolute left-[4cqh] top-[22cqh] h-[3cqh] w-[28cqh] rounded-full bg-[#1d2226]/80" />
        <span className="absolute left-[4cqh] top-[27.5cqh] h-[2.2cqh] w-[36cqh] rounded-full bg-[#1d2226]/25" />
        <span className="absolute left-[4cqh] top-[32cqh] h-[2.2cqh] w-[22cqh] rounded-full bg-[#1d2226]/25" />
        <span
          className="wii-connect wii-ambient absolute left-[4cqh] top-[38cqh] h-[6cqh] w-[18cqh] rounded-full"
          style={{ background: LINKEDIN_BLUE }}
        />
      </span>
    </>
  );
}
