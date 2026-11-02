"use client";

export type { SoundCue as SoundName } from "@/config/audio";
export { initAudio, playSound, setMusic, unlockAudio, useMusicStatus } from "@/lib/audio/engine";
export type { MusicStatus } from "@/lib/audio/engine";
