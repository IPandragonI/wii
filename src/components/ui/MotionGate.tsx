"use client";

import { useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import { usePreferences } from "@/lib/preferences";

/**
 * Chooses between an animated and a still version of something CSS cannot pause, such as an
 * SVG <animateMotion>. Respects both the OS setting and the HOME Menu's "Reduced motion".
 */
export function MotionGate({ animated, still }: { animated: ReactNode; still: ReactNode }) {
  const systemReduced = useReducedMotion();
  const { motion } = usePreferences();
  return <>{systemReduced || motion === "reduced" ? still : animated}</>;
}
