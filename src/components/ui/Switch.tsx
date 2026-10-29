import type { ReactNode } from "react";

interface SwitchProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  icon?: ReactNode;
}

/**
 * An on/off switch styled for the HOME Menu's dark panel. It is a native button with
 * role="switch", so Enter and Space toggle it and screen readers announce its state.
 *
 * Geometry: a 44×24 track (outlined with an inset shadow, not a border, so the knob's
 * positioning box stays 44×24) and a 20px knob inset 2px. The knob travels exactly 20px
 * (44 − 20 − 2 × 2), so the gaps are equal in both states. The track never shrinks, so a
 * narrow row cannot squeeze the knob outside it.
 */
export function Switch({ label, checked, onChange, icon }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex min-h-11 items-center gap-2.5 rounded-full border-2 border-white/25 py-1.5 pl-4 pr-2 text-left text-sm font-bold transition-colors hover:border-wii-cyan focus-visible:border-wii-cyan focus-visible:outline-none aria-checked:border-wii-cyan/70"
    >
      {icon}
      <span>{label}</span>
      <span
        aria-hidden="true"
        data-switch-track
        className={`relative inline-block h-6 w-11 shrink-0 rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.15)] transition-colors duration-200 ${
          checked ? "bg-wii-cyan" : "bg-white/25"
        }`}
      >
        <span
          data-switch-knob
          className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/0.35)] transition-transform duration-200 ease-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}
