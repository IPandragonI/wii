"use client";

import { useSyncExternalStore } from "react";

/**
 * The secret. Two ways to find it: the Konami code on a keyboard, or five quick taps on the
 * menu's clock for touch screens. Either one makes the Mii run across the screen with confetti.
 * Nothing is stored: it can be found again every visit.
 */

const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];

/** For each prefix of the code, the length of its longest proper prefix that is also its suffix. */
const FALLBACK = KONAMI.map((_, end) => {
  for (let length = end; length > 0; length -= 1) {
    if (KONAMI.slice(0, length).every((key, index) => key === KONAMI[end - length + 1 + index])) return length;
  }
  return 0;
});

/**
 * Advances progress through the Konami code. A correct key moves forward. A wrong key falls back
 * to the longest earlier position that still matches what was just typed, so a stray extra
 * "up" before a correct code does not spoil it. Returns the new progress; reaching
 * `KONAMI_LENGTH` means the code was completed.
 */
export function advanceKonami(progress: number, key: string): number {
  const pressed = key.toLowerCase();
  let position = progress;
  while (position > 0 && pressed !== KONAMI[position]) position = FALLBACK[position - 1];
  return pressed === KONAMI[position] ? position + 1 : 0;
}

export const KONAMI_LENGTH = KONAMI.length;

const TAPS_NEEDED = 5;
const TAP_WINDOW_MS = 700;
let taps: number[] = [];

/** Counts a tap on the clock; returns true when it was the fifth in quick succession. */
export function registerClockTap(now = Date.now()): boolean {
  // A tap that comes too long after the previous one starts a new streak.
  const previous = taps[taps.length - 1];
  taps = previous !== undefined && now - previous > TAP_WINDOW_MS ? [now] : [...taps, now];
  if (taps.length >= TAPS_NEEDED) {
    taps = [];
    return true;
  }
  return false;
}

let run = 0;
const listeners = new Set<() => void>();

/** Starts the celebration (restarting it if one is already running). */
export function triggerEasterEgg() {
  run += 1;
  listeners.forEach((listener) => listener());
}

/** A number that changes every time the secret is found; 0 until then. */
export function useEasterEggRun(): number {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => run,
    () => 0,
  );
}
