import type { CSSProperties, ReactNode } from "react";
import { at } from "@/components/ui/scenes/shared";

/** Projects: a fanned stack of miniature channel tiles, each showing a different project. */
function MiniTile({ children, style, delay }: { children: ReactNode; style: CSSProperties; delay: string }) {
  return (
    <span className="wii-float wii-ambient absolute" style={{ ...style, animationDelay: delay }}>
      <span className="absolute inset-0 overflow-hidden rounded-[3cqh] border-[0.8cqh] border-[#d3d7db] bg-white shadow-[0_1.2cqh_3cqh_rgb(30_40_60/0.18)]">
        <span className="absolute inset-[0.6cqh] overflow-hidden rounded-[2cqh]">{children}</span>
      </span>
    </span>
  );
}

export function ProjectsScene() {
  return (
    <>
      <span className="absolute inset-0 bg-gradient-to-b from-[#e8f6fd] to-[#f7fbfe]" />
      <span
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "linear-gradient(to right, rgb(21 146 208 / 0.07) 1px, transparent 1px) 0 0 / 8cqh 8cqh, linear-gradient(to bottom, rgb(21 146 208 / 0.07) 1px, transparent 1px) 0 0 / 8cqh 8cqh",
        }}
      />
      <MiniTile style={{ ...at(-60, 16, 40, 30), rotate: "-9deg" }} delay="-1.2s">
        <span className="absolute inset-0" style={{ background: "repeating-conic-gradient(#c99c66 0 25%, #f7ecd6 0 50%) 0 0 / 7cqh 7cqh" }} />
      </MiniTile>
      <MiniTile style={{ ...at(22, 14, 40, 30), rotate: "8deg" }} delay="-2.4s">
        <span className="absolute inset-0 bg-gradient-to-b from-[#bfe7fb] to-[#e9f8ff]" />
        <span className="absolute inset-x-0 bottom-0 h-[40%] bg-[#4fbbe3]" />
        <span className="absolute bottom-[30%] left-[25%] h-[22%] w-[50%] rounded-[50%] bg-[#f3dea0]" />
        <span className="absolute bottom-[42%] left-[36%] h-[14%] w-[28%] rounded-[50%] bg-[#7cc96b]" />
      </MiniTile>
      <MiniTile style={at(-21, 8, 42, 32)} delay="0s">
        <span className="absolute inset-0 bg-[#7cc96b]" />
        <span className="absolute inset-[22%_14%] rounded-full border-[2.4cqh] border-[#61666f] shadow-[0_0_0_0.5cqh_#e94b4b,inset_0_0_0_0.5cqh_#ffffff]" />
        <span
          className="absolute left-[46%] top-[17%] h-[3.4cqh] w-[2cqh]"
          style={{ background: "repeating-conic-gradient(#1d2024 0 25%, #fff 0 50%) 0 0 / 1cqh 1cqh" }}
        />
      </MiniTile>
    </>
  );
}
