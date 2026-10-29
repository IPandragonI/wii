"use client";

import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { useEffect, type ReactNode } from "react";

import { HomeMenu } from "@/components/home-menu/HomeMenu";
import { usePreferences } from "@/lib/preferences";
import { FADE_SECONDS, useScreenCovered } from "@/lib/screen-transition";
import { unlockAudio } from "@/lib/sound";

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

export function Providers({ children }: { children: ReactNode }) {
  const { motion: motionPreference, cursor } = usePreferences();

  useEffect(() => {
    document.documentElement.dataset.motion = motionPreference;
    document.documentElement.dataset.cursor = cursor;
  }, [motionPreference, cursor]);

  // The first real gesture unlocks audio; nothing can play before it.
  useEffect(() => {
    const unlock = () => void unlockAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  return (
    <MotionConfig reducedMotion={motionPreference === "reduced" ? "always" : "user"}>
      {children}
      <HomeMenu />
      <ScreenFade />
    </MotionConfig>
  );
}
