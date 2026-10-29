import { at } from "@/components/ui/scenes/shared";

/** Sandbox, building, and 3D games: an island in a bright sea, clouds drifting by. */
export function IslandScene() {
  return (
    <>
      <span className="absolute inset-0 bg-gradient-to-b from-[#bfe7fb] via-[#e2f5fe] to-[#e9f8ff]" />
      <span className="absolute rounded-full bg-[#fff1a8] shadow-[0_0_6cqh_#fff3b8]" style={at(34, 8, 18, 18)} />
      <span className="wii-cloud wii-ambient absolute rounded-full bg-white" style={at(-70, 12, 24, 8)} />
      <span className="wii-cloud wii-cloud-slow wii-ambient absolute rounded-full bg-white/90" style={at(10, 22, 18, 6)} />
      <span className="absolute inset-x-0 bottom-0 h-[42cqh] overflow-hidden bg-gradient-to-b from-[#58c3e6] to-[#2b9fd2]">
        <span
          className="wii-waves wii-ambient absolute inset-y-0 -left-[20cqh] w-[calc(100%+40cqh)]"
          style={{ background: "repeating-linear-gradient(170deg, transparent 0 7cqh, rgb(255 255 255 / 0.28) 7cqh 8cqh)" }}
        />
      </span>
      <span className="absolute rounded-[50%] bg-[#f3dea0] shadow-[inset_0_-2cqh_0_#e2c47c]" style={at(-37, 54, 74, 16)} />
      <span className="absolute rounded-[50%] bg-[#7cc96b]" style={at(-23, 52, 46, 10)} />
      <span className="wii-sway wii-ambient absolute" style={at(-16, 22, 24, 32)}>
        <svg viewBox="0 0 40 50" className="h-full w-full" aria-hidden="true">
          <path d="M21 50 Q19 30 22 12" stroke="#8b5a2b" strokeWidth="3.4" fill="none" strokeLinecap="round" />
          <g fill="#3aa55d">
            <path d="M22 12 Q8 6 2 16 Q12 10 22 14 Z" />
            <path d="M22 12 Q36 4 40 16 Q30 9 22 14 Z" />
            <path d="M22 12 Q14 0 4 4 Q15 4 22 13 Z" />
            <path d="M22 12 Q30 -1 38 5 Q28 4 22 13 Z" />
          </g>
        </svg>
      </span>
    </>
  );
}
