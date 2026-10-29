"use client";

import { useRouter } from "next/navigation";
import { useCallback, useSyncExternalStore } from "react";

import { localePath } from "@/i18n/config";
import { getCurrentLocale } from "@/i18n/client";
import { getPreferences } from "@/lib/preferences";
import { playSound } from "@/lib/sound";

/**
 * A full-screen white veil used between screens, like the console's fade when a channel
 * starts or when returning to the menu. Destination screens call `revealScreen()` on mount.
 */

export const FADE_SECONDS = 0.38;

let covered = false;
let safety: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function useScreenCovered(): boolean {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => covered,
    () => false,
  );
}

export function prefersReducedMotion(): boolean {
  if (getPreferences().motion === "reduced") return true;
  return typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

/** Fades the screen to white and resolves once it is fully covered. */
export function coverScreen(): Promise<void> {
  if (prefersReducedMotion()) return Promise.resolve();
  covered = true;
  emit();
  clearTimeout(safety);
  // Never leave the veil up if a navigation fails or is cancelled.
  safety = setTimeout(revealScreen, 4000);
  return new Promise((resolve) => setTimeout(resolve, FADE_SECONDS * 1000));
}

export function revealScreen(): void {
  clearTimeout(safety);
  if (!covered) return;
  covered = false;
  emit();
}

/** Navigation with the console's transitions: Start into a channel, or back to the menu. */
export function useScreenNavigation() {
  const router = useRouter();

  const enterChannel = useCallback(
    async (href: string) => {
      playSound("start");
      router.prefetch(href);
      await coverScreen();
      router.push(href);
    },
    [router],
  );

  const returnToMenu = useCallback(async () => {
    playSound("back");
    const menu = localePath(getCurrentLocale(), "/");
    router.prefetch(menu);
    await coverScreen();
    router.push(menu);
  }, [router]);

  return { enterChannel, returnToMenu };
}
