"use client";

import { useEffect, useState } from "react";

import { useCurrentLocale } from "@/i18n/client";
import { messagesFor } from "@/i18n/messages";
import { advanceKonami, KONAMI_LENGTH, triggerEasterEgg, useEasterEggRun } from "@/lib/easter-egg";
import { prefersReducedMotion } from "@/lib/screen-transition";
import { playSound } from "@/lib/sound";

const SHOW_MS = 6000;
const CONFETTI = 44;
const COLORS = ["#34beed", "#3aa55d", "#f2b630", "#e5484d", "#6a4ec2", "#ffffff"];

/** True while the visitor is typing somewhere, so the code is never read from a form field. */
function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

/**
 * Listens for the Konami code, and when the secret is found, shows the Mii running across the
 * screen under falling confetti. Purely decorative and non-blocking (it never takes focus or
 * clicks); a screen reader gets one polite announcement. With reduced motion, only the speech
 * bubble appears.
 */
export function EasterEgg() {
  const run = useEasterEggRun();
  const locale = useCurrentLocale();
  const text = messagesFor(locale).easterEgg.found;
  // The run whose celebration has finished; the current one shows until its timer ends.
  const [finished, setFinished] = useState(0);
  const shownRun = run !== 0 && run !== finished ? run : 0;
  const calm = shownRun !== 0 && prefersReducedMotion();

  useEffect(() => {
    let progress = 0;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || isTyping(event.target)) return;
      progress = advanceKonami(progress, event.key);
      if (progress === KONAMI_LENGTH) {
        progress = 0;
        triggerEasterEgg();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (run === 0) return;
    playSound("start");
    const timer = setTimeout(() => setFinished(run), SHOW_MS);
    return () => clearTimeout(timer);
  }, [run]);

  if (shownRun === 0) return null;

  return (
    <div key={shownRun} className="pointer-events-none fixed inset-0 z-[90] overflow-hidden" role="status">
      <span className="sr-only">{text}</span>
      <div aria-hidden="true">
        {!calm &&
          Array.from({ length: CONFETTI }, (_, index) => (
            <span
              key={index}
              className="wii-egg-confetti absolute top-0 block h-3 w-2 rounded-[2px]"
              style={{
                left: `${(index * 37 + 11) % 100}%`,
                background: COLORS[index % COLORS.length],
                animationDelay: `${((index * 13) % 22) / 10}s`,
                animationDuration: `${2.6 + ((index * 7) % 14) / 10}s`,
              }}
            />
          ))}
        <div className={calm ? "absolute inset-x-0 bottom-24 flex justify-center" : "wii-egg-run absolute bottom-20 left-0"}>
          <div className="relative h-44 w-40 sm:h-56 sm:w-48">
            <span className="absolute -top-2 left-1/2 z-10 -translate-x-[20%] whitespace-nowrap rounded-2xl border-2 border-[#c9cdd1] bg-white px-4 py-2 text-base font-extrabold text-wii-blue shadow-channel">
              {text}
            </span>
            <span className={calm ? "block h-full w-full" : "wii-egg-bounce block h-full w-full"}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/models/mii/wave-a.png" alt="" draggable={false} className="absolute inset-0 h-full w-full object-contain" />
              {!calm && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src="/models/mii/wave-b.png" alt="" draggable={false} className="wii-egg-frame absolute inset-0 h-full w-full object-contain" />
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
