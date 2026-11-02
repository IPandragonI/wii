"use client";

import { useSyncExternalStore } from "react";

import { audioFiles, type MusicTrack, type SoundCue } from "@/config/audio";
import { startSynthMusic, type MusicPlayer } from "@/lib/audio/music";
import { SYNTH_CUES } from "@/lib/audio/synth";
import { getPreferences, MAX_VOLUME, subscribePreferences } from "@/lib/preferences";

/**
 * The site's audio engine.
 *
 * - The audio context is created as soon as the app loads and asked to start. Browsers that
 *   allow autoplay (for example, for a returning visitor) start the music immediately; the others
 *   keep the context suspended, and the first real gesture (pointer, key, or touch) starts it.
 *   Nothing is played, and no bypass is attempted, while the browser says no.
 * - Effects and music have separate buses under one master volume (the "speaker bars").
 * - Each cue/track uses a configured audio file when one has loaded, and the original
 *   synthesized version otherwise (see src/config/audio.ts).
 * - Music pauses while the tab is hidden and follows the music preference live.
 */

const MUSIC_LEVEL = 0.32;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfxBus: GainNode | null = null;
let musicBus: GainNode | null = null;
let unlocked = false;
let initialized = false;
let bound = false;
/** The early context is swapped for a gesture-born one at most once. */
let swapped = false;

const buffers = new Map<string, AudioBuffer>();
const loading = new Set<string>();

let wantedTrack: MusicTrack | null = null;
let playingTrack: MusicTrack | null = null;
let player: MusicPlayer | null = null;

function masterLevel() {
  return (getPreferences().volume / MAX_VOLUME) ** 1.5;
}

function ensureContext(): AudioContext | null {
  if (typeof window === "undefined" || !("AudioContext" in window)) return null;
  if (ctx) return ctx;
  ctx = new AudioContext();
  ctx.addEventListener("statechange", syncState);
  master = ctx.createGain();
  master.gain.value = masterLevel();
  master.connect(ctx.destination);
  sfxBus = ctx.createGain();
  sfxBus.connect(master);
  musicBus = ctx.createGain();
  musicBus.gain.value = MUSIC_LEVEL;
  musicBus.connect(master);

  if (!bound) {
    bound = true;
    subscribePreferences(() => {
      if (master && ctx) master.gain.setTargetAtTime(masterLevel(), ctx.currentTime, 0.05);
      updateMusic();
      emitStatus();
    });
    document.addEventListener("visibilitychange", updateMusic);
  }
  return ctx;
}

/**
 * Chrome starts a context created inside a gesture almost at once, but one created earlier and
 * resumed later takes over a second. So if the early context is still suspended when the first
 * gesture arrives, it is replaced by a fresh one created right there. Nothing was playing on it.
 */
function swapForGestureContext() {
  swapped = true;
  const old = ctx;
  ctx = master = sfxBus = musicBus = null;
  unlocked = false;
  playingTrack = null;
  player = null;
  old?.close().catch(() => {});
  ensureContext();
}

/** Follows the context's real state; the first time it is running, files load and music starts. */
function syncState() {
  const running = ctx?.state === "running";
  if (running && !unlocked) {
    unlocked = true;
    for (const [key, url] of Object.entries(audioFiles)) if (url) void loadFile(key, url);
    detachGestureListeners();
    updateMusic();
  } else if (!running && unlocked) {
    // Suspended again (for example, the browser interrupted audio): music stops until it resumes.
    unlocked = false;
    updateMusic();
  }
  emitStatus();
}

const GESTURES = ["pointerdown", "keydown", "touchend", "click"] as const;

function onGesture() {
  if (ctx && ctx.state !== "running" && !swapped) swapForGestureContext();
  void unlockAudio();
}

function detachGestureListeners() {
  for (const type of GESTURES) window.removeEventListener(type, onGesture, true);
}

/**
 * Starts the audio engine as early as the page allows: creates the context and asks it to run.
 * If the browser blocks autoplay, a real gesture later does the same, and the listeners are
 * removed as soon as audio is running, so there is no polling and no repeated failing attempts.
 */
export function initAudio(): void {
  if (initialized) return;
  const audio = ensureContext();
  if (!audio) return;
  initialized = true;
  if (audio.state === "running") {
    syncState();
    return;
  }
  for (const type of GESTURES) window.addEventListener(type, onGesture, { capture: true, passive: true });
  void unlockAudio();
  emitStatus();
}

export type MusicStatus = "off" | "playing" | "blocked";

const statusListeners = new Set<() => void>();
let status: MusicStatus = "off";

function computeStatus(): MusicStatus {
  const { music, volume } = getPreferences();
  if (!music || volume === 0) return "off";
  return unlocked ? "playing" : "blocked";
}

function emitStatus() {
  const next = computeStatus();
  if (next === status) return;
  status = next;
  statusListeners.forEach((listener) => listener());
}

/**
 * Whether the music is off by choice, playing, or wanted but waiting for the browser to allow
 * audio (blocked until the visitor's first interaction).
 */
export function useMusicStatus(): MusicStatus {
  return useSyncExternalStore(
    (listener) => {
      statusListeners.add(listener);
      return () => statusListeners.delete(listener);
    },
    () => status,
    () => "off",
  );
}

async function loadFile(key: string, url: string) {
  if (!ctx || buffers.has(key) || loading.has(key)) return;
  loading.add(key);
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(String(response.status));
    buffers.set(key, await ctx.decodeAudioData(await response.arrayBuffer()));
    if (key.startsWith("music:") && playingTrack && key === `music:${playingTrack}`) {
      // Swap the synthesized loop for the recorded one once it is ready.
      playingTrack = null;
      updateMusic();
    }
  } catch {
    // Keep using the synthesized version.
  } finally {
    loading.delete(key);
  }
}

/**
 * Asks the browser to start audio. Safe to call at any time and any number of times: it does
 * nothing once audio is running, and a refusal (no user gesture yet) is not an error.
 */
export function unlockAudio(): Promise<void> {
  const audio = ensureContext();
  if (!audio) return Promise.resolve();
  if (audio.state === "running") {
    syncState();
    return Promise.resolve();
  }
  return audio
    .resume()
    .catch(() => {})
    .then(syncState);
}

export function playSound(cue: SoundCue): void {
  if (!getPreferences().sound || getPreferences().volume === 0) return;
  if (!unlocked) {
    // Hover is not a gesture; everything else is, so it may unlock audio and then play.
    if (cue === "hover" || cue === "buttonHover") return;
    void unlockAudio().then(() => unlocked && emit(cue));
    return;
  }
  emit(cue);
}

function emit(cue: SoundCue) {
  if (!ctx || !sfxBus || ctx.state !== "running") return;

  const buffer = buffers.get(cue);
  if (buffer) {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(sfxBus);
    source.start();
    return;
  }
  SYNTH_CUES[cue](ctx, sfxBus, ctx.currentTime + 0.005);
}

/** Selects the background track for the current screen (null for silence). */
export function setMusic(track: MusicTrack | null): void {
  wantedTrack = track;
  updateMusic();
}

function updateMusic() {
  const shouldPlay =
    unlocked && wantedTrack !== null && getPreferences().music && getPreferences().volume > 0 && !document.hidden;
  const target = shouldPlay ? wantedTrack : null;
  if (target === playingTrack || !ctx || !musicBus) return;

  player?.stop(target ? 0.8 : 0.4);
  player = null;
  playingTrack = target;
  if (!target) return;

  const buffer = buffers.get(`music:${target}`);
  if (buffer) {
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = buffer;
    source.loop = true;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 1);
    source.connect(gain).connect(musicBus);
    source.start();
    const audio = ctx;
    player = {
      stop(fade = 0.6) {
        gain.gain.cancelScheduledValues(audio.currentTime);
        gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), audio.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + fade);
        source.stop(audio.currentTime + fade + 0.05);
      },
    };
  } else {
    player = startSynthMusic(ctx, musicBus, target);
  }
}
