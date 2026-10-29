"use client";

import { audioFiles, type MusicTrack, type SoundCue } from "@/config/audio";
import { startSynthMusic, type MusicPlayer } from "@/lib/audio/music";
import { SYNTH_CUES } from "@/lib/audio/synth";
import { getPreferences, MAX_VOLUME, subscribePreferences } from "@/lib/preferences";

/**
 * The site's audio engine.
 *
 * - Nothing is created or played before the visitor's first pointer or keyboard gesture.
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
let unlocking: Promise<void> | null = null;

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
  master = ctx.createGain();
  master.gain.value = masterLevel();
  master.connect(ctx.destination);
  sfxBus = ctx.createGain();
  sfxBus.connect(master);
  musicBus = ctx.createGain();
  musicBus.gain.value = MUSIC_LEVEL;
  musicBus.connect(master);

  subscribePreferences(() => {
    if (master && ctx) master.gain.setTargetAtTime(masterLevel(), ctx.currentTime, 0.05);
    updateMusic();
  });
  document.addEventListener("visibilitychange", updateMusic);
  return ctx;
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

/** Call from a user gesture. Later sounds and music are allowed from then on. */
export function unlockAudio(): Promise<void> {
  const audio = ensureContext();
  if (!audio) return Promise.resolve();
  unlocking ??= audio
    .resume()
    .then(() => {
      unlocked = true;
      for (const [key, url] of Object.entries(audioFiles)) if (url) void loadFile(key, url);
      updateMusic();
    })
    .catch(() => {
      unlocking = null;
    });
  return unlocking;
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
