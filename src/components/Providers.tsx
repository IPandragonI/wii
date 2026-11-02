"use client";

import { Volume2 } from "lucide-react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { useEffect, type ReactNode } from "react";

import { HomeMenu } from "@/components/home-menu/HomeMenu";
import { usePreferences } from "@/lib/preferences";
import { FADE_SECONDS, useScreenCovered } from "@/lib/screen-transition";
import { useCurrentLocale } from "@/i18n/client";
import { messagesFor } from "@/i18n/messages";
import { initAudio, unlockAudio, useMusicStatus } from "@/lib/sound";

/** The white veil shown while moving between the menu and a channel. */
function ScreenFade() {
  const covered = useScreenCovered();
  return (
    <AnimatePresence>
      {covered && (
        <motion.div
          key="veil"
          aria-hidden="true"
          className="fixed inset-0 z-[100] bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_SECONDS, ease: "easeInOut" }}
        />
      )}
    </AnimatePresence>
  );
}

/**
 * Shown only while the music is switched on but the browser has not yet allowed audio. Any
 * first tap or key press starts it, so this is a hint, not a required step; it vanishes
 * the moment audio runs.
 */
function MusicHint() {
  const status = useMusicStatus();
  const text = messagesFor(useCurrentLocale()).common.startMusic;
  if (status !== "blocked") return null;
  return (
    <button
      type="button"
      onClick={() => void unlockAudio()}
      className="fixed right-3 top-3 z-30 flex min-h-11 items-center gap-2 rounded-full border-2 border-[#c9cdd1] bg-white/90 px-3 text-sm font-bold text-wii-ink shadow-channel backdrop-blur transition-colors hover:border-wii-cyan hover:text-wii-blue focus-visible:border-wii-cyan focus-visible:outline-none"
    >
      <Volume2 aria-hidden="true" size={18} className="text-wii-cyan motion-safe:animate-pulse" />
      <span className="hidden sm:inline">{text}</span>
      <span className="sr-only sm:hidden">{text}</span>
    </button>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  const { motion: motionPreference, cursor } = usePreferences();

  useEffect(() => {
    document.documentElement.dataset.motion = motionPreference;
    document.documentElement.dataset.cursor = cursor;
  }, [motionPreference, cursor]);

  // Try to start audio right away; if the browser blocks it, the first gesture does (see initAudio).
  useEffect(() => initAudio(), []);

  return (
    <MotionConfig reducedMotion={motionPreference === "reduced" ? "always" : "user"}>
      {children}
      <HomeMenu />
      <ScreenFade />
      <MusicHint />
    </MotionConfig>
  );
}
