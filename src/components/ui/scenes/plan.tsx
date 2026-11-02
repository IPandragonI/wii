import { at } from "@/components/ui/scenes/shared";

/**
 * Voyo: apartment viewings. A floor plan on drafting paper; a dashed route is drawn from the
 * front door through the living room and hallway to the bedroom, where a pin lands, and a key
 * hangs at the door.
 */
export function PlanScene() {
  return (
    <>
      <span
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(rgb(197 184 160 / 0.28) 1px, transparent 1px) 0 0 / 7cqh 7cqh, linear-gradient(90deg, rgb(197 184 160 / 0.28) 1px, transparent 1px) 0 0 / 7cqh 7cqh, #fbf4e8",
        }}
      />
      <svg viewBox="0 0 120 80" className="absolute drop-shadow-[0_1cqh_1.4cqh_rgb(90_70_40/0.18)]" style={at(-60, 6, 120, 80)} aria-hidden="true">
        {/* Rooms */}
        <rect x="8" y="8" width="62" height="50" fill="#fde9d6" />
        <rect x="70" y="8" width="42" height="28" fill="#dcefea" />
        <rect x="70" y="36" width="42" height="22" fill="#e6e3f6" />
        <rect x="8" y="58" width="104" height="14" fill="#f5efe2" />
        {/* Furniture */}
        <rect x="14" y="14" width="26" height="10" rx="4" fill="#f0b98a" />
        <rect x="14" y="26" width="10" height="14" rx="3" fill="#f0b98a" />
        <circle cx="52" cy="40" r="6" fill="#f6cfa9" />
        <rect x="78" y="14" width="26" height="18" rx="2.5" fill="#b9dccf" />
        <rect x="80" y="16" width="10" height="6" rx="2" fill="#f4faf8" />
        <rect x="94" y="16" width="8" height="6" rx="2" fill="#f4faf8" />
        <rect x="96" y="41" width="12" height="14" rx="5" fill="#cfc9ee" />
        {/* Walls and doors */}
        <g fill="none" stroke="#3b4a5a" strokeWidth="2.2" strokeLinecap="square">
          <path d="M8 8 H112 V72 H8 Z" />
          <path d="M70 8 V28 M70 36 V58 M70 36 H112 M8 58 H34 M44 58 H112" />
        </g>
        <path d="M34 58 A10 10 0 0 1 44 48" fill="none" stroke="#3b4a5a" strokeWidth="0.9" strokeDasharray="1.6 1.2" />
        <path d="M70 28 A8 8 0 0 0 62 36" fill="none" stroke="#3b4a5a" strokeWidth="0.9" strokeDasharray="1.6 1.2" />
        {/* The route, drawn from the entrance to the bedroom. */}
        <path
          d="M12 72 V64 H39 V46 H52 V32 H64 V32 L70 32 H88 V30"
          pathLength="100"
          fill="none"
          stroke="#e0703c"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="100"
          className="wii-trace wii-ambient"
        />
        <circle cx="12" cy="72" r="2.8" fill="#e0703c" />
      </svg>

      {/* The pin lands in the bedroom once the route is drawn. */}
      <span className="wii-pin wii-ambient absolute" style={at(21, 4, 14, 20)}>
        <svg viewBox="0 0 28 40" className="h-full w-full drop-shadow-[0_0.8cqh_0.6cqh_rgb(0_0_0/0.25)]" aria-hidden="true">
          <path d="M14 38 C14 38 3 24 3 14 A11 11 0 0 1 25 14 C25 24 14 38 14 38 Z" fill="#e0703c" stroke="#fff" strokeWidth="2" />
          <circle cx="14" cy="14" r="4.4" fill="#fff" />
        </svg>
      </span>

      {/* A key hangs by the door. */}
      <span className="wii-float wii-ambient absolute" style={at(-58, 60, 16, 16)}>
        <svg viewBox="0 0 32 32" className="h-full w-full drop-shadow-[0_0.6cqh_0.5cqh_rgb(0_0_0/0.22)]" aria-hidden="true">
          <circle cx="10" cy="12" r="6" fill="none" stroke="#c98a0b" strokeWidth="3" />
          <path d="M15 16 L28 29 M23 24 L27 20 M26 27 L29 24" fill="none" stroke="#c98a0b" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </span>
    </>
  );
}
