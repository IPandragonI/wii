"use client";

import { useSyncExternalStore } from "react";

/**
 * The Message Board: one welcome letter, and whether the visitor has read it yet. The envelope in
 * the menu's bottom bar shows a badge until they do. "Read" is remembered in localStorage so
 * returning visitors are not nagged; if storage is unavailable, the badge simply shows each visit.
 */

const STORAGE_KEY = "wii-portfolio:message-read";

export interface MessageBoardState {
  /** The letter is open. */
  open: boolean;
  /** The letter has not been read yet (never true during server rendering). */
  unread: boolean;
}

const SERVER: MessageBoardState = { open: false, unread: false };
let state: MessageBoardState | null = null;
const listeners = new Set<() => void>();

function readFromStorage(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "1";
  } catch {
    return true;
  }
}

function current(): MessageBoardState {
  state ??= { open: false, unread: readFromStorage() };
  return state;
}

function set(next: MessageBoardState) {
  state = next;
  listeners.forEach((listener) => listener());
}

/** Opens the letter and marks it read. */
export function openMessageBoard() {
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Storage unavailable; it stays unread for the next visit.
  }
  set({ open: true, unread: false });
}

export function closeMessageBoard() {
  set({ ...current(), open: false });
}

export function useMessageBoard(): MessageBoardState {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    current,
    () => SERVER,
  );
}

/** Test helper: forget everything, as if the page had just loaded. */
export function resetMessageBoard() {
  state = null;
}
