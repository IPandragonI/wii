import { at } from "@/components/ui/scenes/shared";

/** Guitar tuner and chords: a fretboard whose six strings vibrate, and a tuner needle
 *  settling into the green "in tune" zone. */
export function MusicScene() {
  return (
    <>
      <span className="absolute inset-0 bg-gradient-to-b from-[#fff6f2] to-[#fde8e2]" />
      <span className="absolute inset-x-0 bg-gradient-to-b from-[#7a4a2c] to-[#5c361f] shadow-[0_1cqh_3cqh_rgb(0_0_0/0.25)]" style={{ top: "26cqh", height: "44cqh" }}>
        <span
          className="absolute inset-0"
          style={{ background: "repeating-linear-gradient(90deg, transparent 0 21cqh, #d9d3c7 21cqh 22cqh)", backgroundPosition: "calc(50% + 4cqh) 0" }}
        />
        {[-44, 0, 44].map((x) => (
          <span
            key={x}
            className="absolute h-[4cqh] w-[4cqh] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ left: `calc(50% + ${x - 7}cqh)`, top: "50%", background: "var(--tint)" }}
          />
        ))}
      </span>
      {/* Strings: thicker toward the bottom, each vibrating at its own rate */}
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <span
          key={index}
          className="wii-string wii-ambient absolute inset-x-0"
          style={{
            top: `${30 + index * 7.2}cqh`,
            height: `${0.5 + index * 0.18}cqh`,
            background: index < 3 ? "linear-gradient(#fdfaf2, #cfc6b4)" : "linear-gradient(#f0d9a8, #b8955a)",
            animationDuration: `${0.16 + index * 0.025}s`,
            animationDelay: `${-index * 0.05}s`,
          }}
        />
      ))}
      {/* Tuner */}
      <span className="absolute overflow-hidden rounded-full bg-white/90 shadow-[0_0.5cqh_1.5cqh_rgb(0_0_0/0.12)]" style={at(-36, 8, 72, 9)}>
        <span className="absolute inset-y-[2cqh] left-[calc(50%-5cqh)] w-[10cqh] rounded-full bg-[#3aa55d]/30" />
        {[-28, -14, 0, 14, 28].map((x) => (
          <span key={x} className="absolute top-[2.5cqh] h-[4cqh] w-[0.5cqh] bg-[#9ba0a7]" style={{ left: `calc(50% + ${x}cqh)` }} />
        ))}
        <span className="wii-needle wii-ambient absolute left-1/2 top-[1cqh] h-[7cqh] w-[0.9cqh] -translate-x-1/2 rounded-full" style={{ background: "var(--tint)" }} />
      </span>
    </>
  );
}
