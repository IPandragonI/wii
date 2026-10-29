"use client";

import { useSyncExternalStore } from "react";

export type MotionPreference = "system" | "reduced";
export type CursorPreference = "hand" | "system";

export interface Preferences {
  /** Sound effects on/off. */
  sound: boolean;
  /** Background music on/off. */
  music: boolean;
  /** Master volume in speaker bars, 0 (silent) to 4, like a remote's speaker setting. */
  volume: number;
  motion: MotionPreference;
  cursor: CursorPreference;
}

export const MAX_VOLUME = 4;

const STORAGE_KEY = "wii-portfolio:preferences";
const DEFAULTS: Preferences = { sound: true, music: true, volume: 3, motion: "system", cursor: "hand" };

let current: Preferences = DEFAULTS;
let loaded = false;
const listeners = new Set<() => void>();

function load(): Preferences {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return DEFAULTS;
    const record = parsed as Record<string, unknown>;
    const volume = typeof record.volume === "number" ? Math.round(record.volume) : DEFAULTS.volume;
    return {
      sound: typeof record.sound === "boolean" ? record.sound : DEFAULTS.sound,
      music: typeof record.music === "boolean" ? record.music : DEFAULTS.music,
      volume: Math.min(MAX_VOLUME, Math.max(0, volume)),
      motion: record.motion === "reduced" ? "reduced" : "system",
      cursor: record.cursor === "system" ? "system" : "hand",
    };
  } catch {
    return DEFAULTS;
  }
}

export function getPreferences(): Preferences {
  if (!loaded && typeof window !== "undefined") {
    current = load();
    loaded = true;
  }
  return current;
}

export function setPreferences(update: Partial<Preferences>): void {
  current = { ...getPreferences(), ...update };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Storage can be unavailable (private mode); the preference still applies for this visit.
  }
  listeners.forEach((listener) => listener());
}

export function subscribePreferences(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function usePreferences(): Preferences {
  return useSyncExternalStore(subscribePreferences, getPreferences, () => DEFAULTS);
}
