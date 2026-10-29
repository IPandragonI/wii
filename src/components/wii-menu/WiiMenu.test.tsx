// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { nextChannelIndex, WiiMenu } from "@/components/wii-menu/WiiMenu";
import type { MenuChannel } from "@/lib/menu";

const push = vi.fn();
const prefetch = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, prefetch }) }));

function setReducedMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduce && query.includes("reduce"),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    onchange: null,
    dispatchEvent: vi.fn(),
  }));
}

const channel = (key: string, title: string, extra: Partial<MenuChannel> = {}): MenuChannel => ({
  key,
  title,
  subtitle: "Game",
  href: `/projects/${key}`,
  banner: "arcade",
  tint: "cyan",
  ...extra,
});

const channels = [
  channel("islebound", "Islebound"),
  channel("kart", "Kart Racing"),
  channel("checkmate", "Checkmate"),
  channel("carspotter", "Carspotter"),
  channel("about", "About Me", { href: "/about" }),
];

const grid = () => screen.getByRole("region", { name: "Channels" });

beforeEach(() => {
  push.mockReset();
  prefetch.mockReset();
  setReducedMotion(true);
});

describe("WiiMenu", () => {
  it("renders one link per channel, generated from data", () => {
    render(<WiiMenu channels={channels} heading="Menu" />);
    const links = within(grid()).getAllByRole("link");
    expect(links).toHaveLength(5);
    expect(links[0]).toHaveAttribute("href", "/projects/islebound");
    expect(links[0]).toHaveAccessibleName("Islebound – Game");
    expect(links[1]).toHaveAccessibleName("Kart Racing – Game");
    expect(screen.getByRole("heading", { level: 1, name: "Menu" })).toBeInTheDocument();
  });

  it("fills the page with decorative empty slots (12 per page)", () => {
    const { container } = render(<WiiMenu channels={channels} heading="Menu" />);
    expect(container.querySelectorAll('li[aria-hidden="true"]')).toHaveLength(12 - channels.length);
  });

  it("splits more than 12 channels into labeled pages", () => {
    const many = Array.from({ length: 14 }, (_, index) => channel(`c${index}`, `Channel ${index}`));
    render(<WiiMenu channels={many} heading="Menu" />);
    expect(screen.getByRole("list", { name: "Page 1 of 2" })).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Page 2 of 2" })).getAllByRole("link")).toHaveLength(2);
  });

  it("opens the channel preview, then Start enters the channel", async () => {
    render(<WiiMenu channels={channels} heading="Menu" />);
    await userEvent.click(screen.getByRole("link", { name: /Checkmate/ }));

    const preview = await screen.findByRole("dialog", { name: "Checkmate channel" });
    expect(push).not.toHaveBeenCalled();
    await userEvent.click(within(preview).getByRole("button", { name: "Start" }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/projects/checkmate"));
  });

  it("opens a deployed project in a new tab from Start, without leaving the portfolio", async () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    render(
      <WiiMenu channels={[channel("live", "Live App", { launchUrl: "https://live.example.com/" }), ...channels]} heading="Menu" />,
    );
    await userEvent.click(screen.getByRole("link", { name: /Live App/ }));
    const preview = await screen.findByRole("dialog", { name: "Live App channel" });
    await userEvent.click(within(preview).getByRole("button", { name: /Start/ }));

    expect(open).toHaveBeenCalledWith("https://live.example.com/", "_blank", "noopener,noreferrer");
    expect(push).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    open.mockRestore();
  });

  it("ignores a non-https launch URL and enters the channel instead", async () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    render(<WiiMenu channels={[channel("odd", "Odd", { launchUrl: "javascript:alert(1)" })]} heading="Menu" />);
    await userEvent.click(screen.getByRole("link", { name: /Odd/ }));
    const preview = await screen.findByRole("dialog");
    await userEvent.click(within(preview).getByRole("button", { name: /Start/ }));
    expect(open).not.toHaveBeenCalled();
    await waitFor(() => expect(push).toHaveBeenCalledWith("/projects/odd"));
    open.mockRestore();
  });

  it("returns from the preview to the menu with the Menu button", async () => {
    render(<WiiMenu channels={channels} heading="Menu" />);
    await userEvent.click(screen.getByRole("link", { name: /Carspotter/ }));
    const preview = await screen.findByRole("dialog");
    await waitFor(() => expect(within(preview).getByRole("button", { name: "Start" })).toHaveFocus());

    await userEvent.click(within(preview).getByRole("button", { name: "Menu" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(push).not.toHaveBeenCalled();
  });

  it("opens from the keyboard and closes with Escape", async () => {
    render(<WiiMenu channels={channels} heading="Menu" />);
    screen.getByRole("link", { name: /Islebound/ }).focus();
    await userEvent.keyboard("{Enter}");
    const preview = await screen.findByRole("dialog");
    await waitFor(() => expect(within(preview).getByRole("button", { name: "Start" })).toHaveFocus());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("leaves modified clicks (new tab) to the browser", () => {
    render(<WiiMenu channels={channels} heading="Menu" />);
    fireEvent.click(screen.getByRole("link", { name: /Checkmate/ }), { ctrlKey: true });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("moves focus with the arrow keys", () => {
    render(<WiiMenu channels={channels} heading="Menu" />);
    const list = within(grid()).getByRole("list");
    // jsdom has no layout; an inline template stands in for the 4-column grid.
    list.style.gridTemplateColumns = "1fr 1fr 1fr 1fr";
    const links = within(grid()).getAllByRole("link");
    links[0].focus();
    fireEvent.keyDown(links[0], { key: "ArrowRight" });
    expect(links[1]).toHaveFocus();
    fireEvent.keyDown(links[1], { key: "ArrowLeft" });
    fireEvent.keyDown(links[0], { key: "ArrowDown" });
    expect(links[4]).toHaveFocus();
    fireEvent.keyDown(links[4], { key: "Home" });
    expect(links[0]).toHaveFocus();
  });
});

describe("nextChannelIndex", () => {
  it("moves within a 4×3 page", () => {
    expect(nextChannelIndex(0, "ArrowRight", 12, 4)).toBe(1);
    expect(nextChannelIndex(1, "ArrowDown", 12, 4)).toBe(5);
    expect(nextChannelIndex(9, "ArrowDown", 12, 4)).toBe(9);
    expect(nextChannelIndex(5, "ArrowUp", 12, 4)).toBe(1);
  });

  it("continues on the neighboring page in the same row", () => {
    expect(nextChannelIndex(7, "ArrowRight", 24, 4)).toBe(16);
    expect(nextChannelIndex(16, "ArrowLeft", 24, 4)).toBe(7);
    expect(nextChannelIndex(3, "ArrowRight", 12, 4)).toBe(3);
  });

  it("lands on the last channel when the target slot of the next page is empty", () => {
    expect(nextChannelIndex(7, "ArrowRight", 14, 4)).toBe(13);
  });

  it("follows the visual grid in the two-column mobile layout", () => {
    expect(nextChannelIndex(0, "ArrowDown", 5, 2)).toBe(2);
    expect(nextChannelIndex(3, "ArrowDown", 5, 2)).toBe(3);
    expect(nextChannelIndex(4, "End", 5, 2)).toBe(4);
  });
});
