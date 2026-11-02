// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

import { closeMessageBoard, openMessageBoard, resetMessageBoard, useMessageBoard } from "@/lib/message-board";
import { renderHook, act } from "@testing-library/react";

describe("message board", () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetMessageBoard();
  });

  it("starts unread for a first-time visitor and closed", () => {
    const { result } = renderHook(() => useMessageBoard());
    expect(result.current).toEqual({ open: false, unread: true });
  });

  it("opening the letter marks it read and remembers that", () => {
    const { result } = renderHook(() => useMessageBoard());
    act(() => openMessageBoard());
    expect(result.current).toEqual({ open: true, unread: false });
    act(() => closeMessageBoard());
    expect(result.current).toEqual({ open: false, unread: false });

    resetMessageBoard(); // a later visit
    const later = renderHook(() => useMessageBoard());
    expect(later.result.current.unread).toBe(false);
  });

  it("still works, and shows the badge each visit, when storage is unavailable", () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const { result } = renderHook(() => useMessageBoard());
    expect(result.current.unread).toBe(true);
    act(() => openMessageBoard());
    expect(result.current).toEqual({ open: true, unread: false });
    getItem.mockRestore();
    setItem.mockRestore();
  });
});
