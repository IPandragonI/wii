"use client";

import { useSyncExternalStore } from "react";

/** Open state of the HOME Menu overlay, shared by every screen's HOME button. */
export interface HomeMenuState {
  open: boolean;
  /** True when opened from inside a channel, so "Menu" leaves the channel. */
  inChannel: boolean;
}

let state: HomeMenuState = { open: false, inChannel: false };
const listeners = new Set<() => void>();
const CLOSED: HomeMenuState = { open: false, inChannel: false };

function set(next: HomeMenuState) {
  state = next;
  listeners.forEach((listener) => listener());
}

export function openHomeMenu(options: { inChannel: boolean }) {
  set({ open: true, inChannel: options.inChannel });
}

export function closeHomeMenu() {
  set({ ...state, open: false });
}

export function useHomeMenu(): HomeMenuState {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
    () => CLOSED,
  );
}
