import type { SoundCue } from "@/config/audio";

/**
 * Original synthesized interface sounds. They aim for the soft, glassy character of a
 * console menu (light ticks, airy whooshes, bell chimes) without copying any real recording.
 */

export const midi = (note: number) => 440 * 2 ** ((note - 69) / 12);

let noiseBuffer: AudioBuffer | null = null;
export function noise(ctx: BaseAudioContext): AudioBuffer {
  if (noiseBuffer && noiseBuffer.sampleRate === ctx.sampleRate) return noiseBuffer;
  noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  return noiseBuffer;
}

function envelope(gain: GainNode, t: number, peak: number, attack: number, decay: number) {
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}

/** A soft bell: a sine with a quiet, fast-fading overtone. */
export function bell(ctx: BaseAudioContext, out: AudioNode, t: number, note: number, peak = 0.12, decay = 0.9) {
  for (const [ratio, level, length] of [
    [1, 1, decay],
    [4, 0.18, decay * 0.35],
  ] as const) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = midi(note) * ratio;
    envelope(gain, t, peak * level, 0.004, length);
    osc.connect(gain).connect(out);
    osc.start(t);
    osc.stop(t + length + 0.05);
  }
}

function tick(ctx: BaseAudioContext, out: AudioNode, t: number, frequency: number, peak: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(frequency, t);
  osc.frequency.exponentialRampToValueAtTime(frequency * 0.82, t + 0.04);
  envelope(gain, t, peak, 0.002, 0.045);
  osc.connect(gain).connect(out);
  osc.start(t);
  osc.stop(t + 0.08);
}

/** Band-passed noise whose center frequency glides, heard as an airy whoosh. */
function whoosh(ctx: BaseAudioContext, out: AudioNode, t: number, from: number, to: number, duration: number, peak: number) {
  const source = ctx.createBufferSource();
  source.buffer = noise(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 1.4;
  filter.frequency.setValueAtTime(from, t);
  filter.frequency.exponentialRampToValueAtTime(to, t + duration);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + duration * 0.45);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  source.connect(filter).connect(gain).connect(out);
  source.start(t);
  source.stop(t + duration + 0.05);
}

function glide(ctx: BaseAudioContext, out: AudioNode, t: number, from: number, to: number, duration: number, peak: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(to, t + duration * 0.7);
  envelope(gain, t, peak, 0.01, duration);
  osc.connect(gain).connect(out);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

export const SYNTH_CUES: Record<SoundCue, (ctx: BaseAudioContext, out: AudioNode, t: number) => void> = {
  hover: (ctx, out, t) => tick(ctx, out, t, 2350, 0.07),
  buttonHover: (ctx, out, t) => tick(ctx, out, t, 1650, 0.06),
  select: (ctx, out, t) => {
    whoosh(ctx, out, t, 350, 2800, 0.5, 0.22);
    bell(ctx, out, t + 0.06, 88, 0.07, 0.6);
    bell(ctx, out, t + 0.14, 95, 0.05, 0.7);
  },
  zoomOut: (ctx, out, t) => {
    whoosh(ctx, out, t, 2600, 380, 0.42, 0.2);
    bell(ctx, out, t + 0.05, 83, 0.05, 0.5);
  },
  start: (ctx, out, t) => {
    [72, 76, 79, 84, 88].forEach((note, index) => bell(ctx, out, t + index * 0.065, note, 0.1, 1.1));
    whoosh(ctx, out, t + 0.1, 600, 5000, 0.9, 0.08);
  },
  back: (ctx, out, t) => {
    [84, 79, 76].forEach((note, index) => bell(ctx, out, t + index * 0.07, note, 0.08, 0.7));
  },
  homeOpen: (ctx, out, t) => {
    glide(ctx, out, t, 480, 960, 0.22, 0.12);
    bell(ctx, out, t + 0.1, 91, 0.04, 0.4);
  },
  homeClose: (ctx, out, t) => glide(ctx, out, t, 900, 450, 0.2, 0.11),
  page: (ctx, out, t) => {
    whoosh(ctx, out, t, 900, 2200, 0.28, 0.16);
    tick(ctx, out, t + 0.02, 1900, 0.04);
  },
  toggle: (ctx, out, t) => tick(ctx, out, t, 1250, 0.09),
};
