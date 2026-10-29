"use client";

import { useEffect, type RefObject } from "react";

/**
 * Pauses the animations of elements that are scrolled out of view, using one observer shared
 * by every channel tile. An off-screen element gets `data-offscreen`, which pauses its CSS
 * animations (see globals.css); SVG SMIL animations (the race karts) are paused through the
 * SVG API, since CSS cannot reach them.
 */

let observer: IntersectionObserver | null = null;

function setPaused(element: Element, paused: boolean) {
  element.toggleAttribute("data-offscreen", paused);
  for (const svg of element.querySelectorAll("svg")) {
    if (paused) svg.pauseAnimations();
    else svg.unpauseAnimations();
  }
}

function sharedObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === "undefined") return null;
  // A small margin starts animations just before a tile scrolls into view.
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) setPaused(entry.target, !entry.isIntersecting);
    },
    { rootMargin: "64px" },
  );
  return observer;
}

export function usePauseWhenOffscreen(ref: RefObject<Element | null>) {
  useEffect(() => {
    const element = ref.current;
    const shared = sharedObserver();
    if (!element || !shared) return;
    shared.observe(element);
    return () => {
      shared.unobserve(element);
      setPaused(element, false);
    };
  }, [ref]);
}
