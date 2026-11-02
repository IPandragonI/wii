import type { CSSProperties } from "react";

import { at } from "@/components/ui/scenes/shared";

/**
 * Authserver: single sign-on. One central identity server (the shield) vouches for several
 * applications: a token leaves the shield, reaches each app in turn, and the app's lock
 * turns into a green check.
 */

interface App {
  x: number;
  y: number;
  /** Where the token travels, from the shield's edge to the app's edge. */
  dx: number;
  dy: number;
  delay: number;
}

const APPS: App[] = [
  { x: -17, y: 3, dx: 0, dy: -17, delay: 0 },
  { x: -64, y: 34, dx: -30, dy: 0, delay: 0.9 },
  { x: 30, y: 34, dx: 30, dy: 0, delay: 1.8 },
];

export function SsoScene() {
  return (
    <>
      <span className="absolute inset-0 bg-gradient-to-b from-[#f2f0fc] to-[#dedaf3]" />
      <span className="absolute rounded-full bg-[#5b4bc4]/10" style={at(-34, 12, 68, 68)} />

      {/* Links from the identity server to each application. */}
      <svg viewBox="-70 0 140 100" className="absolute" style={at(-70, 0, 140, 100)} aria-hidden="true">
        {APPS.map((app) => (
          <path
            key={app.x}
            d={`M0 46 L${app.dx} ${46 + app.dy}`}
            stroke="#5b4bc4"
            strokeOpacity="0.5"
            strokeWidth="1.4"
            strokeDasharray="2.6 2.6"
            className="wii-dash wii-ambient"
          />
        ))}
      </svg>

      {APPS.map((app) => (
        <AppWindow key={app.x} app={app} />
      ))}

      {/* The identity server. */}
      <span className="absolute" style={at(-12, 31, 24, 30)}>
        <svg viewBox="0 0 48 60" className="h-full w-full drop-shadow-[0_1cqh_1cqh_rgb(60_40_150/0.35)]" aria-hidden="true">
          <path d="M24 3 L44 10 V30 C44 43 35 52 24 57 C13 52 4 43 4 30 V10 Z" fill="#5b4bc4" stroke="#fff" strokeWidth="2.6" strokeLinejoin="round" />
          <circle cx="24" cy="26" r="6" fill="#fff" />
          <path d="M21.5 30 H26.5 L28 42 H20 Z" fill="#fff" />
          <circle cx="24" cy="26" r="2.4" fill="#5b4bc4" />
        </svg>
      </span>

      {/* Tokens, one per application, leaving the shield in turn. */}
      {APPS.map((app) => (
        <span
          key={`token-${app.x}`}
          className="wii-token wii-ambient absolute rounded-full bg-[#f2b630] ring-[0.7cqh] ring-white/80"
          style={
            {
              ...at(-2, 44, 4, 4),
              "--dx": `${app.dx}cqh`,
              "--dy": `${app.dy}cqh`,
              animationDelay: `${app.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </>
  );
}

function AppWindow({ app }: { app: App }) {
  return (
    <span
      className="absolute overflow-hidden rounded-[2.4cqh] bg-white shadow-[0_1cqh_2cqh_rgb(60_40_150/0.2)] ring-1 ring-[#5b4bc4]/20"
      style={at(app.x, app.y, 34, 24)}
    >
      <span className="absolute inset-x-0 top-0 flex h-[6.5cqh] items-center gap-[1.4cqh] bg-[#e9e6f8] px-[2.2cqh]">
        {["#ee7b6b", "#f2c14e", "#7ccf8b"].map((color) => (
          <span key={color} className="h-[2cqh] w-[2cqh] rounded-full" style={{ background: color }} />
        ))}
      </span>
      <span className="absolute left-[3cqh] top-[10cqh] h-[2.2cqh] w-[16cqh] rounded-full bg-[#d9d4f1]" />
      <span className="absolute left-[3cqh] top-[15cqh] h-[2.2cqh] w-[11cqh] rounded-full bg-[#e6e2f6]" />
      {/* A padlock that becomes a check once the token arrives. */}
      <span
        className="wii-unlock wii-ambient absolute right-[3cqh] top-[9.5cqh] flex h-[8cqh] w-[8cqh] items-center justify-center rounded-full"
        style={{ animationDelay: `${app.delay}s` }}
      >
        <svg viewBox="0 0 16 16" className="wii-unlock-check wii-ambient h-[5cqh] w-[5cqh]" style={{ animationDelay: `${app.delay}s` }} aria-hidden="true">
          <path d="M3.5 8.5 L7 12 L13 4.5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </span>
  );
}
