"use client";

import { AnimatePresence, motion } from "motion/react";
import { House, Minus, Music, Plus, RotateCcw, Volume2 } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { Switch } from "@/components/ui/Switch";
import { closeHomeMenu, useHomeMenu } from "@/lib/home-menu";
import { MAX_VOLUME, setPreferences, usePreferences, type Preferences } from "@/lib/preferences";
import { useScreenNavigation } from "@/lib/screen-transition";
import { playSound } from "@/lib/sound";

const EASE = [0.25, 0.9, 0.3, 1] as const;

/**
 * The HOME Menu: the screen dims, a dark bar drops from the top, another rises from the
 * bottom with the speaker and other settings, and two large buttons appear in the middle.
 * A native <dialog> provides focus trapping and Escape.
 */
export function HomeMenu() {
  const { open, inChannel } = useHomeMenu();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [visible, setVisible] = useState(false);
  const titleId = useId();
  const { returnToMenu } = useScreenNavigation();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      playSound("homeOpen");
      setVisible(true);
    } else if (!open && dialog.open) {
      playSound("homeClose");
      setVisible(false);
    }
  }, [open]);

  const goToMenu = () => {
    closeHomeMenu();
    if (inChannel) void returnToMenu();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        closeHomeMenu();
      }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none select-none overflow-hidden bg-transparent p-0 text-white backdrop:bg-transparent"
    >
      <AnimatePresence onExitComplete={() => dialogRef.current?.close()}>
        {visible && (
          <motion.div key="home" className="absolute inset-0 flex flex-col" initial="closed" animate="open" exit="closed">
            <motion.div
              className="absolute inset-0 bg-black/45"
              variants={{ closed: { opacity: 0 }, open: { opacity: 1 } }}
              transition={{ duration: 0.22 }}
              onClick={() => closeHomeMenu()}
            />

            <motion.header
              className="relative z-10 flex h-20 items-center justify-between border-b border-white/10 bg-gradient-to-b from-[#2e3237]/95 to-[#1d2024]/95 px-5 shadow-[0_6px_24px_rgb(0_0_0/0.3)] sm:h-24 sm:px-10"
              variants={{ closed: { y: "-100%" }, open: { y: 0 } }}
              transition={{ duration: 0.28, ease: EASE }}
            >
              <h2 id={titleId} className="text-2xl tracking-wide sm:text-3xl">
                HOME Menu
              </h2>
              <button
                type="button"
                autoFocus
                onClick={() => closeHomeMenu()}
                onPointerEnter={() => playSound("buttonHover")}
                className="flex h-12 items-center gap-2 rounded-full border-2 border-white/25 px-4 font-bold transition-colors hover:border-wii-cyan hover:text-wii-cyan focus-visible:border-wii-cyan"
              >
                <House aria-hidden="true" size={20} strokeWidth={3} />
                Close
              </button>
            </motion.header>

            <motion.div
              className="relative z-10 flex flex-1 items-center justify-center gap-4 px-5 sm:gap-10"
              variants={{ closed: { opacity: 0, scale: 0.92 }, open: { opacity: 1, scale: 1 } }}
              transition={{ duration: 0.24, ease: EASE, delay: 0.04 }}
            >
              <HomeButton onClick={goToMenu} icon={<House aria-hidden="true" size={28} />}>
                {inChannel ? "Menu" : "Back to Menu"}
              </HomeButton>
              <HomeButton onClick={() => window.location.reload()} icon={<RotateCcw aria-hidden="true" size={28} />}>
                Reset
              </HomeButton>
            </motion.div>

            <motion.footer
              className="relative z-10 border-t border-white/10 bg-gradient-to-b from-[#2e3237]/95 to-[#1d2024]/95 px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-6px_24px_rgb(0_0_0/0.3)] sm:px-10"
              variants={{ closed: { y: "100%" }, open: { y: 0 } }}
              transition={{ duration: 0.28, ease: EASE }}
            >
              <HomeSettings />
            </motion.footer>
          </motion.div>
        )}
      </AnimatePresence>
    </dialog>
  );
}

function HomeButton({ children, icon, onClick }: { children: ReactNode; icon: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerEnter={() => playSound("buttonHover")}
      className="flex h-28 w-[min(15rem,42vw)] flex-col items-center justify-center gap-2 rounded-full border-[3px] border-[#c9e6f4] bg-gradient-to-b from-white to-[#e4f3fb] text-lg font-extrabold text-[#3d6a82] shadow-[0_4px_18px_rgb(0_0_0/0.35)] transition-[border-color,box-shadow,transform] hover:border-wii-cyan hover:shadow-[0_0_0_3px_rgb(52_190_237/0.45),0_0_22px_rgb(52_190_237/0.6)] focus-visible:border-wii-cyan active:scale-95 sm:h-36 sm:text-xl"
    >
      {icon}
      {children}
    </button>
  );
}

function HomeSettings() {
  const preferences = usePreferences();
  const update = (change: Partial<Preferences>) => {
    setPreferences(change);
    playSound("toggle");
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-4">
      <div className="flex items-center gap-3" role="group" aria-label="Speaker volume">
        <Volume2 aria-hidden="true" size={22} className="text-white/70" />
        <RoundIconButton
          label="Lower volume"
          disabled={preferences.volume === 0}
          onClick={() => update({ volume: preferences.volume - 1 })}
        >
          <Minus aria-hidden="true" size={18} strokeWidth={3} />
        </RoundIconButton>
        <div className="flex items-end gap-1" aria-hidden="true">
          {Array.from({ length: MAX_VOLUME }, (_, index) => (
            <span
              key={index}
              className={`w-3 rounded-sm transition-colors ${index < preferences.volume ? "bg-wii-cyan" : "bg-white/20"}`}
              style={{ height: 10 + index * 6 }}
            />
          ))}
        </div>
        <span className="sr-only" aria-live="polite">
          Volume {preferences.volume} of {MAX_VOLUME}
        </span>
        <RoundIconButton
          label="Raise volume"
          disabled={preferences.volume === MAX_VOLUME}
          onClick={() => update({ volume: preferences.volume + 1 })}
        >
          <Plus aria-hidden="true" size={18} strokeWidth={3} />
        </RoundIconButton>
      </div>

      <Switch
        label="Music"
        icon={<Music aria-hidden="true" size={16} />}
        checked={preferences.music}
        onChange={(music) => update({ music })}
      />
      <Switch label="Sound effects" checked={preferences.sound} onChange={(sound) => update({ sound })} />
      <Switch
        label="Reduced motion"
        checked={preferences.motion === "reduced"}
        onChange={(reduced) => update({ motion: reduced ? "reduced" : "system" })}
      />
      <Switch
        label="Hand pointer"
        checked={preferences.cursor === "hand"}
        onChange={(hand) => update({ cursor: hand ? "hand" : "system" })}
      />
    </div>
  );
}

function RoundIconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 transition-colors hover:border-wii-cyan hover:text-wii-cyan disabled:opacity-35 disabled:hover:border-white/30 disabled:hover:text-white"
    >
      {children}
    </button>
  );
}
