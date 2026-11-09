import type { ReactNode } from "react";
import { at } from "@/components/ui/scenes/shared";

/**
 * All Projects: a catalogue wall. Two tilted rows of miniature channel tiles drift in opposite
 * directions on a light gray background, like browsing everything. Eight different previews
 * repeat along each row (chess, island, karting, darts, road, guitar, neural network, floor plan).
 */
const PITCH = 40; // cqh between tile origins
const FACES = 8;
const TILES_PER_ROW = 18; // two pattern repeats (16) plus the overscan needed by wide banners

function Chess() {
  return <span className="absolute inset-0" style={{ background: "repeating-conic-gradient(#c99c66 0 25%, #f7ecd6 0 50%) 0 0 / 6cqh 6cqh" }} />;
}

function Island() {
  return (
    <>
      <span className="absolute inset-0 bg-gradient-to-b from-[#bfe7fb] to-[#e9f8ff]" />
      <span className="absolute inset-x-0 bottom-0 h-[40%] bg-[#4fbbe3]" />
      <span className="absolute bottom-[30%] left-[25%] h-[22%] w-[50%] rounded-[50%] bg-[#f3dea0]" />
      <span className="absolute bottom-[42%] left-[36%] h-[14%] w-[28%] rounded-[50%] bg-[#7cc96b]" />
    </>
  );
}

function Kart() {
  return (
    <>
      <span className="absolute inset-0 bg-[#7cbf67]" />
      <span className="absolute inset-[22%_14%] rounded-full border-[2.2cqh] border-[#61666f] shadow-[0_0_0_0.5cqh_#e94b4b,inset_0_0_0_0.5cqh_#ffffff]" />
      <span
        className="absolute left-[46%] top-[17%] h-[3.4cqh] w-[2cqh]"
        style={{ background: "repeating-conic-gradient(#1d2024 0 25%, #fff 0 50%) 0 0 / 1cqh 1cqh" }}
      />
    </>
  );
}

function Darts() {
  return (
    <span
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(circle at 50% 50%, #d23c3c 0 7%, #2f8f4e 7% 14%, #f2e6c9 14% 36%, #d23c3c 36% 42%, #1f2125 42% 54%, #f2e6c9 54% 70%, #2f8f4e 70% 76%, #1f2125 76%)",
      }}
    />
  );
}

function Road() {
  return (
    <>
      <span className="absolute inset-0 bg-gradient-to-b from-[#9fd3f5] to-[#f6e7d2]" />
      <span className="absolute inset-x-0 bottom-0 h-[55%] bg-[#7cbf67]" />
      <span className="absolute inset-x-0 bottom-0 h-[55%] bg-[#5d636e]" style={{ clipPath: "polygon(46% 0, 54% 0, 100% 100%, 0 100%)" }} />
      <span className="absolute bottom-0 left-[49%] h-[55%] w-[2%] bg-white/90" />
    </>
  );
}

function Guitar() {
  return (
    <>
      <span className="absolute inset-0 bg-[#f1d9ae]" />
      <span className="absolute inset-0" style={{ background: "repeating-linear-gradient(0deg, transparent 0 16%, #7a5a2e 16% 18%)" }} />
      <span className="absolute left-[34%] top-[28%] h-[44%] w-[32%] rounded-full bg-[#3a2a1a] shadow-[0_0_0_1cqh_#c99c66]" />
    </>
  );
}

function Network() {
  const nodes: [number, number][] = [
    [18, 22],
    [18, 58],
    [50, 12],
    [50, 40],
    [50, 68],
    [82, 30],
    [82, 54],
  ];
  const links: [number, number][] = [
    [0, 2], [0, 3], [1, 3], [1, 4], [2, 5], [3, 5], [3, 6], [4, 6],
  ];
  return (
    <>
      <span className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 40%, #ffffff, #d6eefa)" }} />
      <svg viewBox="0 0 100 80" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {links.map(([from, to]) => (
          <line key={`${from}-${to}`} x1={nodes[from][0]} y1={nodes[from][1]} x2={nodes[to][0]} y2={nodes[to][1]} stroke="#1592d0" strokeOpacity="0.5" strokeWidth="1.6" />
        ))}
        {nodes.map(([x, y]) => (
          <circle key={`${x}${y}`} cx={x} cy={y} r="5.5" fill="#ffffff" stroke="#1592d0" strokeWidth="2.2" />
        ))}
      </svg>
    </>
  );
}

function Plan() {
  return (
    <>
      <span className="absolute inset-0 bg-[#fbf4e8]" />
      <svg viewBox="0 0 100 80" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <rect x="8" y="8" width="52" height="46" fill="#fde9d6" />
        <rect x="60" y="8" width="32" height="26" fill="#dcefea" />
        <rect x="60" y="34" width="32" height="20" fill="#e6e3f6" />
        <path d="M8 8 H92 V70 H8 Z M60 8 V54 M60 34 H92 M8 54 H92" fill="none" stroke="#3b4a5a" strokeWidth="2.4" />
        <path d="M14 66 V60 H34 V40 H46 V24 H60 H76 V22" fill="none" stroke="#e0703c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="14" cy="66" r="3.4" fill="#e0703c" />
      </svg>
    </>
  );
}

const FACE_COMPONENTS: (() => ReactNode)[] = [Chess, Island, Kart, Darts, Road, Guitar, Network, Plan];

function MiniTile({ index, row }: { index: number; row: number }) {
  const Face = FACE_COMPONENTS[(index + row * 4) % FACES];
  return (
    <span className="absolute" style={at(0, 0, 34, 28, { left: `${index * PITCH}cqh` })}>
      <span className="absolute inset-0 overflow-hidden rounded-[3cqh] border-[0.8cqh] border-white bg-white shadow-[0_1.2cqh_2.6cqh_rgb(40_50_70/0.28)] ring-1 ring-black/10">
        <span className="absolute inset-[0.6cqh] overflow-hidden rounded-[2cqh]">
          <Face />
        </span>
      </span>
    </span>
  );
}

function Row({ y, row, reverse }: { y: number; row: number; reverse?: boolean }) {
  const width = TILES_PER_ROW * PITCH;
  return (
    <span
      className={`${reverse ? "wii-marquee-rev" : "wii-marquee"} wii-ambient absolute`}
      style={{ left: `calc(50% - ${width / 2}cqh)`, top: `${y}cqh`, width: `${width}cqh`, height: "28cqh" }}
    >
      {Array.from({ length: TILES_PER_ROW }, (_, index) => (
        <MiniTile key={index} index={index} row={row} />
      ))}
    </span>
  );
}

export function ProjectsScene() {
  return (
    <>
      <span className="absolute inset-0" style={{ background: "linear-gradient(160deg, #eef0f3, #d9dde3)" }} />
      <span
        className="absolute inset-0 opacity-70"
        style={{ background: "radial-gradient(circle, rgb(60 70 90 / 0.18) 0.5cqh, transparent 0.6cqh) 0 0 / 7cqh 7cqh" }}
      />
      <span className="absolute inset-0" style={{ rotate: "-6deg" }}>
        <Row y={12} row={0} />
        <Row y={48} row={1} reverse />
      </span>
    </>
  );
}
