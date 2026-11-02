"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { MouseEvent } from "react";

import { useScreenNavigation } from "@/lib/screen-transition";
import { playSound } from "@/lib/sound";

export interface ProjectNavLink {
  name: string;
  href: string;
}

/**
 * Previous and next project, so visitors can browse the work without going back to the menu.
 * Uses the console's Start transition; modified clicks (new tab) behave normally.
 */
export function ProjectNav({
  previous,
  next,
  previousLabel,
  nextLabel,
}: {
  previous?: ProjectNavLink;
  next?: ProjectNavLink;
  previousLabel: string;
  nextLabel: string;
}) {
  const { enterChannel } = useScreenNavigation();
  if (!previous && !next) return null;

  const go = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    void enterChannel(href);
  };

  return (
    <nav aria-label={`${previousLabel} / ${nextLabel}`} className="mt-8 grid gap-4 sm:grid-cols-2">
      {previous ? (
        <Link
          href={previous.href}
          onClick={go(previous.href)}
          onPointerEnter={() => playSound("buttonHover")}
          className="wii-button justify-start"
        >
          <ChevronLeft aria-hidden="true" size={22} strokeWidth={3} />
          <span className="min-w-0 text-left">
            <span className="block text-xs font-bold uppercase tracking-wider text-wii-ink-soft">{previousLabel}</span>
            <span className="block truncate">{previous.name}</span>
          </span>
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
      {next && (
        <Link
          href={next.href}
          onClick={go(next.href)}
          onPointerEnter={() => playSound("buttonHover")}
          className="wii-button justify-end sm:col-start-2"
        >
          <span className="min-w-0 text-right">
            <span className="block text-xs font-bold uppercase tracking-wider text-wii-ink-soft">{nextLabel}</span>
            <span className="block truncate">{next.name}</span>
          </span>
          <ChevronRight aria-hidden="true" size={22} strokeWidth={3} />
        </Link>
      )}
    </nav>
  );
}
