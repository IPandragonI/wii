import { at } from "@/components/ui/scenes/shared";

/** Car quiz: a road rushing to the horizon, light streaks passing, and a camera viewfinder
 *  that now and then takes a "photo". */
export function RoadScene() {
  return (
    <>
      <span className="absolute inset-0 bg-gradient-to-b from-[#9fd3f5] via-[#d9efff] to-[#f6e7d2]" />
      <span className="absolute rounded-full bg-[#ffe9a8] shadow-[0_0_8cqh_#ffe9a8]" style={at(28, 14, 16, 16)} />
      <span className="absolute rounded-[50%] bg-[#9fcf8a]" style={at(-130, 36, 130, 30)} />
      <span className="absolute rounded-[50%] bg-[#8cc678]" style={at(-10, 38, 150, 26)} />
      <span className="absolute inset-x-0 bottom-0 h-[52cqh] bg-[#7cbf67]" />
      <span
        className="absolute bottom-0 left-1/2 h-[52cqh] w-[160cqh] -translate-x-1/2 overflow-hidden bg-[#5d636e]"
        style={{ clipPath: "polygon(47% 0, 53% 0, 100% 100%, 0 100%)" }}
      >
        <span
          className="wii-lane wii-ambient absolute -top-[12cqh] left-1/2 h-[calc(100%+12cqh)] w-[2.4cqh] -translate-x-1/2"
          style={{ background: "repeating-linear-gradient(to bottom, #fff 0 6cqh, transparent 6cqh 12cqh)" }}
        />
      </span>
      {/* Light streaks, like passing headlights */}
      {[
        [14, 0, "#ffffff"],
        [22, -1.3, "#ffd27a"],
        [30, -2.6, "#ffffff"],
      ].map(([y, delay, color]) => (
        <span
          key={String(y)}
          className="wii-streak wii-ambient absolute rounded-full"
          style={{ ...at(-90, Number(y) + 30, 40, 1.2), background: `linear-gradient(to right, transparent, ${color})`, animationDelay: `${delay}s` }}
        />
      ))}
      {/* Viewfinder */}
      <span className="wii-viewfinder wii-ambient absolute" style={at(-34, 10, 68, 52)}>
        {[
          "left-0 top-0 border-l-[1cqh] border-t-[1cqh]",
          "right-0 top-0 border-r-[1cqh] border-t-[1cqh]",
          "bottom-0 left-0 border-b-[1cqh] border-l-[1cqh]",
          "bottom-0 right-0 border-b-[1cqh] border-r-[1cqh]",
        ].map((corner) => (
          <span key={corner} className={`absolute h-[9cqh] w-[9cqh] rounded-[1.5cqh] border-white/95 ${corner}`} />
        ))}
        <span className="absolute left-1/2 top-1/2 h-[4cqh] w-[4cqh] -translate-x-1/2 -translate-y-1/2 rounded-full border-[0.6cqh] border-white/90" />
      </span>
      <span className="wii-flash wii-ambient absolute inset-0 bg-white" />
    </>
  );
}
