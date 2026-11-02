// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** A stand-in AudioContext whose autoplay permission the test controls, like a browser's policy. */
class FakeAudioContext extends EventTarget {
  static instances: FakeAudioContext[] = [];
  static allowAutoplay = false;
  /** Set once a "user gesture" has happened; resume() only succeeds after that or with autoplay allowed. */
  static activated = false;

  state: "suspended" | "running" = "suspended";
  currentTime = 0;
  destination = {};
  resume = vi.fn(async () => {
    if (FakeAudioContext.activated || FakeAudioContext.allowAutoplay) this.run();
  });

  constructor() {
    super();
    FakeAudioContext.instances.push(this);
    if (FakeAudioContext.allowAutoplay || FakeAudioContext.activated) this.state = "running";
  }

  close = vi.fn(async () => {});

  run() {
    this.state = "running";
    this.dispatchEvent(new Event("statechange"));
  }

  createGain() {
    return { gain: { value: 1, setTargetAtTime() {}, setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} };
  }
}

async function load() {
  vi.resetModules();
  const engine = await import("@/lib/audio/engine");
  const preferences = await import("@/lib/preferences");
  return { engine, preferences };
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("audio engine autoplay", () => {
  beforeEach(() => {
    FakeAudioContext.instances = [];
    FakeAudioContext.allowAutoplay = false;
    FakeAudioContext.activated = false;
    window.localStorage.clear();
    (window as unknown as Record<string, unknown>).AudioContext = FakeAudioContext;
  });
  afterEach(() => {
    delete (window as unknown as Record<string, unknown>).AudioContext;
  });

  it("tries to start immediately on load, and starts at once when the browser allows autoplay", async () => {
    FakeAudioContext.allowAutoplay = true;
    const { engine } = await load();
    engine.initAudio();
    const [context] = FakeAudioContext.instances;
    expect(context.state).toBe("running");
    // Already playing: no gesture listeners were needed, so a click never calls resume again.
    context.resume.mockClear();
    window.dispatchEvent(new Event("pointerdown"));
    expect(context.resume).not.toHaveBeenCalled();
  });

  it("stays blocked until the first real gesture, then starts and stops listening", async () => {
    const { engine } = await load();
    engine.initAudio();
    const [context] = FakeAudioContext.instances;
    expect(context.resume).toHaveBeenCalledTimes(1);
    await flush();
    expect(context.state).toBe("suspended");

    FakeAudioContext.activated = true;
    window.dispatchEvent(new Event("pointerdown"));
    await flush();
    // The stalled early context is replaced by one created inside the gesture, which runs.
    expect(context.close).toHaveBeenCalledTimes(1);
    expect(FakeAudioContext.instances).toHaveLength(2);
    const [, fresh] = FakeAudioContext.instances;
    expect(fresh.state).toBe("running");

    fresh.resume.mockClear();
    window.dispatchEvent(new Event("pointerdown"));
    window.dispatchEvent(new Event("keydown"));
    expect(fresh.resume).not.toHaveBeenCalled();
    expect(FakeAudioContext.instances).toHaveLength(2);
  });

  it("swaps the early context only once, even if the browser keeps refusing", async () => {
    const { engine } = await load();
    engine.initAudio();
    window.dispatchEvent(new Event("pointerdown"));
    window.dispatchEvent(new Event("keydown"));
    window.dispatchEvent(new Event("click"));
    await flush();
    expect(FakeAudioContext.instances).toHaveLength(2);
  });

  it("creates a single audio context however often it is initialised", async () => {
    const { engine } = await load();
    engine.initAudio();
    engine.initAudio();
    void engine.unlockAudio();
    expect(FakeAudioContext.instances).toHaveLength(1);
  });

  it("does not retry on its own while blocked: only gestures trigger another attempt", async () => {
    const { engine } = await load();
    engine.initAudio();
    const [context] = FakeAudioContext.instances;
    await flush();
    await flush();
    expect(context.resume).toHaveBeenCalledTimes(1);
    window.dispatchEvent(new Event("keydown"));
    const current = FakeAudioContext.instances.at(-1)!;
    expect(current.resume).toHaveBeenCalled();
  });

  it("never throws when the browser refuses to resume", async () => {
    const { engine } = await load();
    engine.initAudio();
    const [context] = FakeAudioContext.instances;
    context.resume.mockRejectedValue(new DOMException("blocked", "NotAllowedError"));
    await expect(engine.unlockAudio()).resolves.toBeUndefined();
  });

  it("keeps the visitor's music-off preference when audio becomes available", async () => {
    const { engine, preferences } = await load();
    preferences.setPreferences({ music: false });
    FakeAudioContext.allowAutoplay = true;
    engine.initAudio();
    engine.setMusic("menu");
    expect(FakeAudioContext.instances[0].state).toBe("running");
    expect(preferences.getPreferences().music).toBe(false);
  });
});
