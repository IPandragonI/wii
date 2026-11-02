"use client";

import { AnimatePresence, motion } from "motion/react";
import { Mail, Send } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { getProfile } from "@/config/profile";
import { useCurrentLocale } from "@/i18n/client";
import { localePath, parseLocalePath } from "@/i18n/config";
import { messagesFor } from "@/i18n/messages";
import { closeMessageBoard, useMessageBoard } from "@/lib/message-board";
import { useScreenNavigation } from "@/lib/screen-transition";
import { playSound, useMusicStatus } from "@/lib/sound";

const EASE = [0.25, 0.9, 0.3, 1] as const;

/**
 * The welcome letter, in the style of the console's Message Board: a paper card over the dimmed
 * menu. It carries the one thing a visitor most needs from a portfolio, whether and where the
 * owner is available, using the profile's own words. Everything shown comes from the profile and
 * the message catalog, in the page's language.
 */
export function MessageBoard() {
  const { open, unread } = useMessageBoard();
  const locale = useCurrentLocale();
  const t = messagesFor(locale).messageBoard;
  const profile = getProfile(locale);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [visible, setVisible] = useState(false);
  const titleId = useId();
  const { enterChannel } = useScreenNavigation();
  const audio = useMusicStatus();
  const chimed = useRef(false);

  // The mail chime, once, shortly after arrival, and only when sound is already running
  // (it never forces audio on, and never plays late on the first click).
  useEffect(() => {
    if (!unread || chimed.current || audio !== "playing") return;
    chimed.current = true;
    const timer = setTimeout(() => playSound("mail"), 1400);
    return () => clearTimeout(timer);
  }, [unread, audio]);

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

  const reply = () => {
    closeMessageBoard();
    const contact = localePath(locale, "/contact");
    if (parseLocalePath(window.location.pathname).path !== "/contact") void enterChannel(contact);
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        closeMessageBoard();
      }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden bg-transparent p-0 backdrop:bg-transparent"
    >
      <AnimatePresence onExitComplete={() => dialogRef.current?.close()}>
        {visible && (
          <motion.div key="letter" className="absolute inset-0 flex items-center justify-center px-4" initial="closed" animate="open" exit="closed">
            <motion.div
              className="absolute inset-0 bg-black/45"
              variants={{ closed: { opacity: 0 }, open: { opacity: 1 } }}
              transition={{ duration: 0.22 }}
              onClick={() => closeMessageBoard()}
            />
            <motion.article
              className="relative w-[min(100%,34rem)] overflow-hidden rounded-[28px] border-[3px] border-[#c9cdd1] bg-gradient-to-b from-white to-[#f1f3f5] text-wii-ink shadow-[0_18px_60px_rgb(0_0_0/0.45)]"
              variants={{ closed: { opacity: 0, scale: 0.86, y: 24 }, open: { opacity: 1, scale: 1, y: 0 } }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <header className="flex items-center gap-3 border-b-2 border-[#dfe2e5] bg-gradient-to-b from-[#f8f9fa] to-[#eceef1] px-5 py-3">
                <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-full border-[3px] border-[#c3c8cd] bg-white text-wii-cyan">
                  <Mail size={20} strokeWidth={2.4} />
                </span>
                <h2 id={titleId} className="text-lg font-extrabold text-[#5e6268]">
                  {t.title}
                </h2>
              </header>
              <div className="space-y-3 px-6 pb-2 pt-5 sm:px-8">
                <p className="text-sm font-bold text-wii-ink-soft">{t.from(profile.name)}</p>
                <p className="text-2xl font-extrabold leading-tight text-wii-ink-strong">{t.subject}</p>
                <p className="leading-relaxed">{t.intro}</p>
                <p className="leading-relaxed text-wii-ink-strong">
                  <span className="font-extrabold">{profile.role}</span>
                  {profile.location && <> · {profile.location}</>}
                </p>
                {profile.availability && (
                  <p className="rounded-2xl border-2 border-[#bfe6f6] bg-wii-cyan-soft px-4 py-3 font-bold text-[#27658a]">{profile.availability}</p>
                )}
              </div>
              <div className="flex flex-col-reverse gap-3 px-6 pb-6 pt-4 sm:flex-row sm:justify-end sm:px-8">
                <button type="button" onClick={() => closeMessageBoard()} onPointerEnter={() => playSound("buttonHover")} className="wii-button">
                  {t.close}
                </button>
                <button type="button" autoFocus onClick={reply} onPointerEnter={() => playSound("buttonHover")} className="wii-button wii-button-primary">
                  <Send aria-hidden="true" size={18} strokeWidth={2.5} />
                  {t.reply}
                </button>
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
    </dialog>
  );
}
