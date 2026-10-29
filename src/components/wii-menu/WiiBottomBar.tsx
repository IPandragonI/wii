"use client";

import { Mail, Settings } from "lucide-react";
import { motion } from "motion/react";

import { ConsoleBar, ConsoleRoundButton } from "@/components/ui/ConsoleBar";
import { WiiClock } from "@/components/wii-menu/WiiClock";
import { openHomeMenu } from "@/lib/home-menu";
import { playSound } from "@/lib/sound";

/** The menu's bottom bar: options on the left, the clock in the middle, messages on the right. */
export function WiiBottomBar({ hidden = false }: { hidden?: boolean }) {
  return (
    <motion.footer
      className="sticky bottom-0 z-20 mt-auto"
      animate={{ y: hidden ? "110%" : 0 }}
      transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
    >
      <ConsoleBar
        label="Menu bar"
        raised
        left={(size) => (
          <ConsoleRoundButton
            label="HOME Menu and settings"
            size={size}
            haspopup
            onClick={() => openHomeMenu({ inChannel: false })}
            icon={<Settings aria-hidden="true" size={size === "large" ? 30 : 22} strokeWidth={2.25} />}
          />
        )}
        center={(compact) => <WiiClock compact={compact} />}
        right={(size) => (
          <ConsoleRoundButton
            label="Contact"
            size={size}
            href="/contact"
            onClick={() => playSound("start")}
            icon={<Mail aria-hidden="true" size={size === "large" ? 30 : 22} strokeWidth={2.25} />}
          />
        )}
      />
    </motion.footer>
  );
}
