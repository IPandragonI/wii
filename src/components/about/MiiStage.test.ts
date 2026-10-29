import { describe, expect, it } from "vitest";

import { wavePose } from "@/components/about/MiiStage";

describe("wavePose", () => {
  it("starts and ends with the arm down", () => {
    expect(wavePose(0)).toEqual({ raise: 0, swing: 0 });
    expect(wavePose(2.8)).toEqual({ raise: 0, swing: 0 });
    expect(wavePose(-1)).toEqual({ raise: 0, swing: 0 });
  });

  it("raises the arm fully and swings it in the middle of the wave", () => {
    const swings = [0.6, 0.8, 1.0, 1.2, 1.4, 1.6].map((t) => wavePose(t));
    expect(swings.every((pose) => pose.raise === 1)).toBe(true);
    expect(Math.max(...swings.map((pose) => pose.swing))).toBeGreaterThan(0.5);
    expect(Math.min(...swings.map((pose) => pose.swing))).toBeLessThan(-0.5);
  });
});
