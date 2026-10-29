import type { MusicTrack } from "@/config/audio";
import { bell, midi, noise } from "@/lib/audio/synth";

/**
 * Original background music, synthesized and sequenced in Web Audio.
 * "menu" is a relaxed, swung electric-piano loop; "channel" is a quieter pad with a slow
 * arpeggio. Both are original compositions written for this site.
 */

interface Note {
  /** Position in swung eighth notes from the start of the bar (0-7). */
  at: number;
  note: number;
  /** Length in eighth notes. */
  length: number;
}

interface Bar {
  chord: number[];
  bass: number;
  melody?: Note[];
}

interface Track {
  bpm: number;
  swing: number;
  bars: Bar[];
  voice: "epiano" | "pad";
  shaker: boolean;
}

const n = (at: number, note: number, length: number): Note => ({ at, note, length });

const TRACKS: Record<MusicTrack, Track> = {
  menu: {
    bpm: 96,
    swing: 0.62,
    voice: "epiano",
    shaker: true,
    bars: [
      { chord: [53, 57, 60, 64, 67], bass: 41, melody: [n(0, 72, 2), n(3, 74, 1), n(4, 76, 3)] },
      { chord: [57, 60, 64, 67], bass: 45, melody: [n(2, 79, 2), n(4, 76, 2), n(6, 74, 2)] },
      { chord: [50, 53, 57, 60, 64], bass: 38, melody: [n(0, 72, 3), n(4, 69, 2), n(6, 72, 2)] },
      { chord: [55, 60, 62, 65], bass: 43, melody: [n(1, 74, 4), n(6, 72, 1), n(7, 74, 1)] },
      { chord: [58, 62, 65, 69], bass: 46, melody: [n(0, 77, 2), n(2, 76, 2), n(4, 74, 2), n(6, 72, 2)] },
      { chord: [57, 60, 64, 67], bass: 45, melody: [n(0, 76, 4), n(5, 72, 1), n(6, 74, 2)] },
      { chord: [55, 58, 62, 65], bass: 43, melody: [n(0, 70, 2), n(2, 72, 2), n(4, 74, 4)] },
      { chord: [48, 55, 58, 60, 65], bass: 36, melody: [n(0, 72, 6)] },
    ],
  },
  channel: {
    bpm: 76,
    swing: 0.5,
    voice: "pad",
    shaker: false,
    bars: [
      { chord: [48, 55, 59, 64], bass: 36 },
      { chord: [45, 52, 55, 60], bass: 33 },
      { chord: [41, 48, 52, 57], bass: 29 },
      { chord: [43, 50, 55, 59], bass: 31 },
    ],
  },
};

function epiano(ctx: BaseAudioContext, out: AudioNode, t: number, note: number, duration: number, velocity: number) {
  const frequency = midi(note);
  const carrier = ctx.createOscillator();
  const modulator = ctx.createOscillator();
  const modulation = ctx.createGain();
  const amp = ctx.createGain();
  carrier.frequency.value = frequency;
  modulator.frequency.value = frequency;
  modulation.gain.setValueAtTime(frequency * 1.6, t);
  modulation.gain.exponentialRampToValueAtTime(frequency * 0.15, t + 0.9);
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(velocity, t + 0.006);
  amp.gain.exponentialRampToValueAtTime(velocity * 0.35, t + 0.5);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + duration + 0.35);
  modulator.connect(modulation).connect(carrier.frequency);
  carrier.connect(amp).connect(out);
  for (const osc of [carrier, modulator]) {
    osc.start(t);
    osc.stop(t + duration + 0.4);
  }
}

function pad(ctx: BaseAudioContext, out: AudioNode, t: number, note: number, duration: number, velocity: number) {
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 900;
  const amp = ctx.createGain();
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.linearRampToValueAtTime(velocity, t + duration * 0.35);
  amp.gain.linearRampToValueAtTime(0.0001, t + duration * 1.1);
  filter.connect(amp).connect(out);
  for (const detune of [-7, 7]) {
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = midi(note);
    osc.detune.value = detune;
    osc.connect(filter);
    osc.start(t);
    osc.stop(t + duration * 1.15);
  }
}

function bass(ctx: BaseAudioContext, out: AudioNode, t: number, note: number, duration: number, velocity: number) {
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const amp = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = midi(note);
  filter.type = "lowpass";
  filter.frequency.value = 650;
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(velocity, t + 0.015);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(filter).connect(amp).connect(out);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

function shaker(ctx: BaseAudioContext, out: AudioNode, t: number, velocity: number) {
  const source = ctx.createBufferSource();
  source.buffer = noise(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 7000;
  const amp = ctx.createGain();
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(velocity, t + 0.004);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  source.connect(filter).connect(amp).connect(out);
  source.start(t, Math.random() * 0.5);
  source.stop(t + 0.07);
}

export interface MusicPlayer {
  stop(fadeSeconds?: number): void;
}

const LOOKAHEAD = 0.3;

export function startSynthMusic(ctx: AudioContext, destination: AudioNode, name: MusicTrack): MusicPlayer {
  const track = TRACKS[name];
  const beat = 60 / track.bpm;
  const barLength = beat * 4;
  const out = ctx.createGain();
  out.gain.setValueAtTime(0.0001, ctx.currentTime);
  out.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 1.2);
  out.connect(destination);

  const eighth = (barStart: number, index: number) =>
    barStart + Math.floor(index / 2) * beat + (index % 2 ? beat * track.swing : 0);

  let barIndex = 0;
  let barStart = ctx.currentTime + 0.1;

  const scheduleBar = (bar: Bar, start: number) => {
    if (track.voice === "epiano") {
      // Comping: a long chord on beat 1, short stabs on the "and" of 2 and on beat 4.
      const hits: [number, number, number][] = [
        [0, 2.5, 0.05],
        [3, 0.7, 0.035],
        [6, 1.2, 0.03],
      ];
      for (const [at, length, velocity] of hits) {
        bar.chord.forEach((note) => epiano(ctx, out, eighth(start, at), note, length * beat * 0.5, velocity));
      }
      bass(ctx, out, eighth(start, 0), bar.bass, beat * 1.6, 0.16);
      bass(ctx, out, eighth(start, 4), bar.bass + 7, beat * 1.2, 0.12);
      bass(ctx, out, eighth(start, 7), bar.bass + 5, beat * 0.4, 0.08);
      for (const note of bar.melody ?? []) {
        bell(ctx, out, eighth(start, note.at), note.note, 0.075, Math.max(0.35, note.length * beat * 0.5));
      }
    } else {
      bar.chord.forEach((note) => pad(ctx, out, start, note, barLength, 0.022));
      bass(ctx, out, start, bar.bass, barLength * 0.9, 0.1);
      // Slow arpeggio across the chord, an octave up.
      bar.chord.forEach((note, index) => bell(ctx, out, start + index * beat, note + 12, 0.035, 1.4));
    }
    if (track.shaker) {
      for (let index = 0; index < 8; index += 1) {
        shaker(ctx, out, eighth(start, index), index % 2 ? 0.02 : 0.01);
      }
    }
  };

  const timer = setInterval(() => {
    while (barStart < ctx.currentTime + LOOKAHEAD) {
      scheduleBar(track.bars[barIndex % track.bars.length], barStart);
      barIndex += 1;
      barStart += barLength;
    }
  }, 80);

  return {
    stop(fadeSeconds = 0.6) {
      clearInterval(timer);
      const now = ctx.currentTime;
      out.gain.cancelScheduledValues(now);
      out.gain.setValueAtTime(Math.max(out.gain.value, 0.0001), now);
      out.gain.exponentialRampToValueAtTime(0.0001, now + fadeSeconds);
      setTimeout(() => out.disconnect(), (fadeSeconds + 2.5) * 1000);
    },
  };
}
