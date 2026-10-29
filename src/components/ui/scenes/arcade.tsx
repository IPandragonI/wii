import { at } from "@/components/ui/scenes/shared";

/** Other games: pixel hills scrolling past, coins bobbing, stars twinkling. */
export function ArcadeScene() {
  return (
    <>
      <span className="absolute inset-0" style={{ background: "linear-gradient(to bottom, var(--tint-soft), #ffffff)" }} />
      {[
        [-52, 12, "0s"],
        [40, 9, "-1.2s"],
        [-26, 22, "-2.1s"],
        [52, 26, "-0.6s"],
      ].map(([x, y, delay]) => (
        <span
          key={`${x}${y}`}
          className="wii-twinkle wii-ambient absolute"
          style={{ ...at(Number(x), Number(y), 3, 3), background: "var(--tint)", animationDelay: String(delay) }}
        />
      ))}
      <span className="absolute inset-x-0 bottom-0 h-[44cqh] overflow-hidden">
        <span
          className="wii-scroll wii-ambient absolute inset-y-0 -left-[48cqh] w-[calc(100%+96cqh)]"
          style={{
            background:
              "linear-gradient(to top, color-mix(in srgb, var(--tint) 55%, white) 0 18cqh, transparent 18cqh) 0 0 / 48cqh 100%, repeating-linear-gradient(90deg, color-mix(in srgb, var(--tint) 35%, white) 0 12cqh, transparent 12cqh 24cqh) 0 100% / 48cqh 30cqh no-repeat",
          }}
        />
      </span>
      {[-30, -10, 10, 30].map((x, index) => (
        <span
          key={x}
          className="wii-bounce wii-ambient absolute rounded-[1cqh] bg-[#ffcf3f] shadow-[inset_-1cqh_-1cqh_0_#e0a91c]"
          style={{ ...at(x - 3, 36, 6, 6), animationDelay: `${index * -0.3}s` }}
        />
      ))}
    </>
  );
}
