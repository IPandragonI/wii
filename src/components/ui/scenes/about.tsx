import { at, type SceneProps } from "@/components/ui/scenes/shared";

/** About Me: the Mii, pre-rendered from the same 3D model as the About channel, waving hello. */
export function AboutScene({ greeting = "Hi!" }: SceneProps) {
  return (
    <>
      <span className="absolute inset-0 bg-gradient-to-b from-[#dff2fd] via-[#f4fbff] to-white" />
      <span
        className="absolute bottom-0 left-1/2 h-[90cqh] w-[340cqh] origin-bottom"
        style={{
          transform: "translateX(-50%) perspective(150cqh) rotateX(62deg)",
          background:
            "linear-gradient(to right, #dfe3e8 0.25cqh, transparent 0.25cqh) 0 0 / 12cqh 12cqh, linear-gradient(to bottom, #dfe3e8 0.25cqh, #f6f7f9 0.25cqh) 0 0 / 12cqh 12cqh",
        }}
      />
      <span className="wii-bounce wii-ambient absolute" style={at(-40, 6, 60, 70)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/models/mii/wave-a.png" alt="" draggable={false} className="absolute inset-0 h-full w-full object-contain" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/models/mii/wave-b.png"
          alt=""
          draggable={false}
          className="wii-wave-frame wii-ambient absolute inset-0 h-full w-full object-contain"
        />
      </span>
      <span className="wii-pop wii-ambient absolute" style={at(16, 12, 34, 20)}>
        <span className="absolute -left-[1.6cqh] bottom-[3cqh] h-[4cqh] w-[4cqh] rotate-45 bg-white" />
        <span className="absolute inset-0 flex items-center justify-center rounded-[5cqh] bg-white text-[10cqh] font-extrabold text-wii-blue shadow-[0_0.8cqh_2.4cqh_rgb(30_40_60/0.14)] ring-1 ring-black/5">
          {greeting}
        </span>
      </span>
    </>
  );
}
