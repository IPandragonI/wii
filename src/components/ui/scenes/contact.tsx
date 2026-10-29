import { at } from "@/components/ui/scenes/shared";

/** Contact: an envelope whose letter slides in and out, and a paper plane gliding along a trail. */
export function ContactScene() {
  return (
    <>
      <span className="absolute inset-0 bg-gradient-to-b from-[#e7f4fc] to-[#f9fcfe]" />
      <svg viewBox="-188.5 0 377 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path
          d="M -120 54 C -70 20 -20 70 30 26 S 110 14 160 30"
          fill="none"
          stroke="#1592d0"
          strokeOpacity="0.35"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      </svg>
      <span className="wii-plane wii-ambient absolute" style={at(-80, 30, 12, 12)}>
        <svg viewBox="0 0 24 24" className="h-full w-full drop-shadow-[0_0.6cqh_0.8cqh_rgb(21_146_208/0.3)]" aria-hidden="true">
          <path d="M2 11 L22 3 L15 21 L11 13 Z" fill="#ffffff" stroke="#1592d0" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M11 13 L22 3" stroke="#1592d0" strokeWidth="1.2" />
        </svg>
      </span>
      {/* Envelope */}
      <span className="absolute" style={at(-30, 22, 50, 38)}>
        <span className="wii-letter wii-ambient absolute left-[10%] top-[8%] h-[70%] w-[80%] rounded-[1.5cqh] bg-white shadow-[0_0.4cqh_1cqh_rgb(0_0_0/0.1)]">
          <span className="absolute left-[12%] top-[16%] h-[8%] w-[60%] rounded-full bg-[#1592d0]/60" />
          <span className="absolute left-[12%] top-[34%] h-[6%] w-[74%] rounded-full bg-[#c3c8cd]" />
          <span className="absolute left-[12%] top-[48%] h-[6%] w-[52%] rounded-full bg-[#c3c8cd]" />
        </span>
        <svg
          viewBox="0 0 100 76"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-[76%] w-full drop-shadow-[0_1cqh_2cqh_rgb(30_40_60/0.18)]"
          aria-hidden="true"
        >
          <path d="M0 6 L50 44 L100 6 L100 76 L0 76 Z" fill="#ffffff" stroke="#c9d6e0" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M0 76 L42 38 M100 76 L58 38" stroke="#dbe4ec" strokeWidth="1.2" />
        </svg>
        <span className="wii-notify wii-ambient absolute -right-[2cqh] top-[18%] h-[8cqh] w-[8cqh] rounded-full border-[0.8cqh] border-white bg-[#e5484d]" />
      </span>
    </>
  );
}
