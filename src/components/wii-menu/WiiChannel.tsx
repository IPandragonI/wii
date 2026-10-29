"use client";

import Link from "next/link";
import type { FocusEvent, MouseEvent } from "react";

import { ChannelArt } from "@/components/ui/ChannelArt";
import type { MenuChannel } from "@/lib/menu";
import { useScreenNavigation } from "@/lib/screen-transition";
import { playSound } from "@/lib/sound";

interface WiiChannelProps {
  channel: MenuChannel;
  onOpen?: (channel: MenuChannel, art: HTMLElement) => void;
  onFocus?: (event: FocusEvent<HTMLAnchorElement>) => void;
}

/**
 * One channel frame: a light gray rounded frame around the channel's animated banner.
 * Pointing at it lights a pulsing blue outline and ticks, like the console menu.
 */
export function WiiChannel({ channel, onOpen, onFocus }: WiiChannelProps) {
  const { enterChannel } = useScreenNavigation();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    // Let the browser handle new-tab and download gestures normally.
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const art = event.currentTarget.querySelector<HTMLElement>("[data-art]") ?? event.currentTarget;
    // Outside the menu (e.g. the Projects channel), go straight in with the Start transition.
    if (onOpen) onOpen(channel, art);
    else void enterChannel(channel.href);
  };

  return (
    <li className="list-none select-none">
      <Link
        href={channel.href}
        data-channel={channel.key}
        aria-label={`${channel.title}${channel.subtitle ? ` – ${channel.subtitle}` : ""}`}
        onClick={handleClick}
        onPointerEnter={(event) => event.pointerType === "mouse" && playSound("hover")}
        onFocus={(event) => {
          playSound("hover");
          onFocus?.(event);
        }}
        className="wii-channel group relative block aspect-[48/35] rounded-[18px] border-[3px] border-[#c9cdd1] bg-gradient-to-b from-white to-[#eef0f2] p-[3px] shadow-channel outline-none transition-transform duration-150 ease-out hover:scale-[1.02] focus-visible:scale-[1.02] active:scale-[0.985] motion-reduce:hover:scale-100 motion-reduce:focus-visible:scale-100"
      >
        <span data-art className="relative block h-full w-full overflow-hidden rounded-[13px] [contain:paint]">
          <ChannelArt
            title={channel.title}
            subtitle={channel.subtitle}
            icon={channel.icon}
            category={channel.category}
            accent={channel.accent}
            banner={channel.banner}
            tint={channel.tint}
          />
        </span>
      </Link>
    </li>
  );
}

/** An unused slot, drawn as a recessed, finely lined frame. */
export function EmptyChannel({ className = "" }: { className?: string }) {
  return (
    <li
      aria-hidden="true"
      className={`hidden aspect-[48/35] list-none rounded-[18px] border-[3px] border-[#d5d8dc] bg-[#e7e9ec] bg-[repeating-linear-gradient(to_bottom,rgb(255_255_255/0.7)_0,rgb(255_255_255/0.7)_2px,transparent_2px,transparent_5px)] shadow-[inset_0_2px_6px_rgb(0_0_0/0.07)] sm:block ${className}`}
    />
  );
}
