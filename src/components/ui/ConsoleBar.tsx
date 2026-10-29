"use client";

import Link from "next/link";
import { useId, type MouseEventHandler, type ReactNode } from "react";

import { playSound } from "@/lib/sound";

/**
 * The shelf's outline: raised at both ends, sweeping down in long, shallow curves to a flat
 * middle, in viewBox units (1000 wide) so the curves always span the same share of the
 * screen. Strokes don't scale, so the lines stay hairline-thin at any width.
 */
function shelfEdge(dip: number) {
  return `M0 4 C 170 4 220 ${dip} 380 ${dip} L 620 ${dip} C 780 ${dip} 830 4 1000 4`;
}

function Shelf({ dip }: { dip: number }) {
  const fillId = useId();
  const glowId = useId();
  const edge = shelfEdge(dip);
  return (
    <svg aria-hidden="true" viewBox="0 0 1000 104" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f8f9fa" />
          <stop offset="0.55" stopColor="#eceef1" />
          <stop offset="1" stopColor="#dde0e4" />
        </linearGradient>
        <linearGradient id={glowId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5cc8ee" stopOpacity="0.9" />
          <stop offset="0.5" stopColor="#9ad9f1" stopOpacity="0.75" />
          <stop offset="1" stopColor="#5cc8ee" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <path d={`${edge} L1000 104 L0 104 Z`} fill={`url(#${fillId})`} />
      {/* Soft glow, the light-blue edge line, and a white bevel just under it. */}
      <path d={edge} fill="none" stroke="#7fd2f0" strokeOpacity="0.28" strokeWidth="6" vectorEffect="non-scaling-stroke" />
      <path d={edge} fill="none" stroke={`url(#${glowId})`} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <path
        d={edge}
        transform="translate(0 3.5)"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.9"
        strokeWidth="1.25"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

const ROUND =
  "flex items-center justify-center rounded-full border-[3px] border-[#c3c8cd] bg-gradient-to-b from-white via-white to-[#e9ecef] text-[#7b8087] shadow-[0_2px_6px_rgb(0_0_0/0.12),inset_0_-2px_0_rgb(0_0_0/0.04)] transition-[border-color,color,box-shadow,transform] duration-150 group-hover:border-wii-cyan group-hover:text-wii-blue group-hover:shadow-[0_0_0_3px_rgb(52_190_237/0.35),0_0_16px_rgb(52_190_237/0.5)] group-focus-visible:border-wii-cyan group-focus-visible:text-wii-blue group-active:scale-95";

interface RoundButtonProps {
  label: string;
  icon: ReactNode;
  size?: "large" | "small";
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  haspopup?: boolean;
}

/** The big round buttons sitting in the bar's raised ends. */
export function ConsoleRoundButton({ label, icon, size = "large", href, onClick, haspopup }: RoundButtonProps) {
  const face = (
    <>
      <span className={`${ROUND} ${size === "large" ? "h-[70px] w-[70px]" : "h-12 w-12"}`}>{icon}</span>
      <span className="sr-only">{label}</span>
    </>
  );
  const shared = {
    title: label,
    onPointerEnter: () => playSound("buttonHover"),
    className: "group rounded-full outline-none",
  };
  if (href) {
    return (
      <Link href={href} onClick={onClick} {...shared}>
        {face}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-haspopup={haspopup ? "dialog" : undefined} {...shared}>
      {face}
    </button>
  );
}

interface ConsoleBarProps {
  left: (size: "large" | "small") => ReactNode;
  right: (size: "large" | "small") => ReactNode;
  /** Content of the middle. With `raised`, it sits across the bar's top edge (the clock). */
  center: (compact: boolean) => ReactNode;
  raised?: boolean;
  label: string;
}

/**
 * The console-style bottom bar: a light gray shelf whose ends curve up to cradle two round
 * buttons. Small screens get a compact, flat version.
 */
export function ConsoleBar({ left, right, center, raised = false, label }: ConsoleBarProps) {
  const dip = raised ? 60 : 34;
  return (
    <div role="toolbar" aria-label={label} className="relative select-none">
      <div className="flex items-center justify-between gap-3 rounded-t-[28px] border-t-2 border-[#8fd5ef] bg-gradient-to-b from-[#f8f9fa] to-[#dde0e4] shadow-[inset_0_2px_0_#fff] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:hidden">
        {left("small")}
        <div className="flex min-w-0 flex-1 justify-center gap-2">{center(true)}</div>
        {right("small")}
      </div>

      <div className="relative hidden h-33 sm:block">
        <div className="absolute inset-x-0 bottom-0 h-[104px]">
          <Shelf dip={dip} />
        </div>
        <div className="absolute bottom-6 left-9">{left("large")}</div>
        <div className="absolute bottom-6 right-9">{right("large")}</div>
        <div
          className={`absolute left-1/2 flex -translate-x-1/2 items-center gap-4 ${raised ? "bottom-3.5" : "bottom-3 h-14.5"}`}
        >
          {center(false)}
        </div>
      </div>
    </div>
  );
}
