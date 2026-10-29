"use client";

import { useSyncExternalStore } from "react";

let now = 0;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    now = Date.now();
    timer = setInterval(() => {
      const next = Date.now();
      // Only notify when the minute changes; the clock shows hours and minutes.
      if (Math.floor(next / 60_000) !== Math.floor(now / 60_000)) {
        now = next;
        listeners.forEach((notify) => notify());
      }
    }, 1_000);
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

function getSnapshot() {
  if (!now) now = Date.now();
  return Math.floor(now / 60_000);
}

/** Minutes since the epoch on the client, null during server rendering. */
function useMinute(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

/** In DSEG fonts "!" is a full-width digit cell with every segment off. */
const BLANK_DIGIT = "!";

export interface ClockParts {
  /** Always two digit cells, so the digits line up with the "88:88" ghost segments. */
  digits: string;
  /** "AM"/"PM" (or the locale's equivalent) for 12-hour locales. */
  period?: string;
}

/** Splits a time into seven-segment digits and the 12-hour period, following the locale. */
export function clockParts(date: Date, locale?: string): ClockParts {
  const parts = new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  const hour = value("hour").replace(/\D/g, "");
  const minute = value("minute").replace(/\D/g, "").padStart(2, "0");
  return {
    digits: `${hour.length < 2 ? BLANK_DIGIT : ""}${hour}:${minute}`,
    period: value("dayPeriod") || undefined,
  };
}

/** Local time and date in the visitor's own timezone and locale conventions. */
export function WiiClock({ compact = false }: { compact?: boolean }) {
  const minute = useMinute();
  const date = minute === null ? null : new Date(minute * 60_000);

  const time = date ? clockParts(date) : null;
  const day = date?.toLocaleDateString(undefined, { weekday: "short", month: "numeric", day: "numeric" });
  const full = date?.toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" });

  return (
    <div className="flex flex-col items-center leading-none" role="timer" aria-live="off" aria-label={full ?? "Current time"}>
      <div className="flex items-end gap-1.5" aria-hidden="true">
        <span
          className={`relative font-segments tracking-[0.04em] text-[#9aa0a7] [text-shadow:0_1px_0_#fff] ${
            compact ? "text-[1.6rem]" : "text-[2.6rem]"
          }`}
        >
          {/* Unlit segments behind the lit ones, like a real LCD. */}
          <span className="absolute inset-0 text-[#9aa0a7]/[0.09] [text-shadow:none]">88:88</span>
          <time dateTime={date?.toISOString()} className="relative">
            {time?.digits ?? `${BLANK_DIGIT}${BLANK_DIGIT}:${BLANK_DIGIT}${BLANK_DIGIT}`}
          </time>
        </span>
        {time?.period && (
          <span className={`pb-0.5 font-extrabold text-[#9aa0a7] ${compact ? "text-[0.6rem]" : "text-xs"}`}>{time.period}</span>
        )}
      </div>
      <span className={`mt-2 font-bold text-wii-ink ${compact ? "text-sm" : "text-lg"}`}>
        {day ?? <span className="invisible">Mon 1/1</span>}
      </span>
    </div>
  );
}
