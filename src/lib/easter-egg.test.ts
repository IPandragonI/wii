import { describe, expect, it } from "vitest";

import { advanceKonami, KONAMI_LENGTH, registerClockTap } from "@/lib/easter-egg";

const run = (keys: string[]) => keys.reduce((progress, key) => advanceKonami(progress, key), 0);
const CODE = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

describe("Konami code", () => {
  it("is completed by the full sequence", () => {
    expect(run(CODE)).toBe(KONAMI_LENGTH);
  });

  it("accepts capital letters (caps lock or shift)", () => {
    expect(run([...CODE.slice(0, 8), "B", "A"])).toBe(KONAMI_LENGTH);
  });

  it("starts over after a wrong key", () => {
    expect(run(["ArrowUp", "ArrowUp", "ArrowDown", "x"])).toBe(0);
    expect(run(["ArrowUp", "ArrowUp", "ArrowDown", "x", ...CODE])).toBe(KONAMI_LENGTH);
  });

  it("treats a wrong ArrowUp as the first key of a fresh attempt", () => {
    expect(run(["ArrowUp", "ArrowUp", "ArrowUp", "ArrowDown", ...CODE.slice(3)])).toBe(KONAMI_LENGTH);
  });

  it("is not completed by a partial sequence", () => {
    expect(run(CODE.slice(0, 9))).toBe(9);
  });
});

describe("clock taps", () => {
  it("fires on the fifth quick tap, then resets", () => {
    const results = [0, 200, 400, 600, 800].map((time) => registerClockTap(1_000_000 + time));
    expect(results).toEqual([false, false, false, false, true]);
    expect(registerClockTap(1_002_000)).toBe(false);
  });

  it("does not fire when the taps are too slow", () => {
    const results = [0, 900, 1800, 2700, 3600].map((time) => registerClockTap(2_000_000 + time));
    expect(results.every((fired) => !fired)).toBe(true);
  });
});
