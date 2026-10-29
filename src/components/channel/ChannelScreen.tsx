"use client";

import { House, Settings } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

import { ChannelIcon } from "@/components/ui/ChannelIcon";
import { ConsoleBar, ConsoleRoundButton } from "@/components/ui/ConsoleBar";
import { openHomeMenu } from "@/lib/home-menu";
import { TINTS, type TintName } from "@/lib/menu";
import { revealScreen, useScreenNavigation } from "@/lib/screen-transition";
import { setMusic } from "@/lib/sound";

interface ChannelScreenProps {
  title: string;
  /** Small labels next to the title, e.g. the project category and status. */
  eyebrow?: ReactNode;
  icon?: string;
  category?: string;
  tint?: TintName;
  children: ReactNode;
  /** The channel's own buttons, shown in the middle of the bottom bar (e.g. Source, Launch). */
  actions?: ReactNode;
}

/**
 * The inside of a channel: a title band with the channel's emblem, the channel content, and
 * the console bar (HOME Menu on the left, back to the menu on the right, actions between).
 * The screen fades in from white; Escape fades back to the menu.
 */
export function ChannelScreen({ title, eyebrow, icon, category, tint = "cyan", children, actions }: ChannelScreenProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { returnToMenu } = useScreenNavigation();
  const colors = TINTS[tint];

  useEffect(() => {
    setMusic("channel");
    revealScreen();
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented || document.querySelector("dialog[open]")) return;
      void returnToMenu();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [returnToMenu]);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 select-none border-b-2 border-[#d3d7db] bg-gradient-to-b from-white to-[#eceef1] shadow-[0_2px_10px_rgb(0_0_0/0.06)]">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-8 sm:py-4 lg:px-12">
          {(icon || category) && (
            <span
              aria-hidden="true"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] border-[3px] border-[#c9cdd1] bg-white shadow-channel sm:h-14 sm:w-14"
              style={{ color: colors.accent }}
            >
              <ChannelIcon icon={icon} category={category} className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={2.2} />
            </span>
          )}
          <div className="min-w-0">
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="truncate text-2xl font-extrabold tracking-tight text-[#5e6268] outline-none sm:text-3xl"
            >
              {title}
            </h1>
            {eyebrow && <div className="mt-1 flex flex-wrap items-center gap-2">{eyebrow}</div>}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-10 pt-6 sm:px-8 sm:pt-8 lg:px-12">{children}</main>

      <footer className="sticky bottom-0 z-20 select-none">
        <ConsoleBar
          label="Channel controls"
          left={(size) => (
            <ConsoleRoundButton
              label="HOME Menu and settings"
              size={size}
              haspopup
              onClick={() => openHomeMenu({ inChannel: true })}
              icon={<Settings aria-hidden="true" size={size === "large" ? 30 : 22} strokeWidth={2.25} />}
            />
          )}
          center={() => actions}
          right={(size) => (
            <ConsoleRoundButton
              label="Back to Menu"
              size={size}
              href="/"
              onClick={(event) => {
                event.preventDefault();
                void returnToMenu();
              }}
              icon={<House aria-hidden="true" size={size === "large" ? 30 : 22} strokeWidth={2.25} />}
            />
          )}
        />
      </footer>
    </div>
  );
}
