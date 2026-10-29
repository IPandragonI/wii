// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { Switch } from "@/components/ui/Switch";
import { clockParts } from "@/components/wii-menu/WiiClock";

function Harness() {
  const [on, setOn] = useState(false);
  return <Switch label="Music" checked={on} onChange={setOn} />;
}

describe("Switch", () => {
  it("toggles with the mouse and keyboard and announces its state", async () => {
    render(<Harness />);
    const toggle = screen.getByRole("switch", { name: "Music" });
    expect(toggle).toHaveAttribute("aria-checked", "false");

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "true");

    toggle.focus();
    await userEvent.keyboard(" ");
    expect(toggle).toHaveAttribute("aria-checked", "false");
    await userEvent.keyboard("{Enter}");
    expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  it("keeps the knob inset equally in both states and the track from shrinking", () => {
    const { container, rerender } = render(<Switch label="Music" checked={false} onChange={() => {}} />);
    const track = container.querySelector("[data-switch-track]")!;
    const knob = container.querySelector("[data-switch-knob]")!;
    // 44px track, 20px knob, 2px inset: off at x=2, on at x=2+20=22 (right gap 44-22-20=2).
    expect(track).toHaveClass("w-11", "h-6", "shrink-0");
    expect(knob).toHaveClass("size-5", "left-0.5", "top-0.5", "translate-x-0");
    rerender(<Switch label="Music" checked onChange={() => {}} />);
    expect(knob).toHaveClass("translate-x-5");
  });
});

describe("clockParts", () => {
  const date = new Date(2026, 9, 29, 9, 5);

  it("pads single-digit hours with a blank seven-segment cell", () => {
    expect(clockParts(date, "en-US")).toEqual({ digits: "!9:05", period: "AM" });
  });

  it("uses 24-hour time without a period where the locale does", () => {
    expect(clockParts(new Date(2026, 9, 29, 17, 42), "fr-FR")).toEqual({ digits: "17:42", period: undefined });
  });
});
