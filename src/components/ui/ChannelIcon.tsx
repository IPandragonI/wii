import { createElement, type ComponentType } from "react";
import {
  BriefcaseBusiness,
  Car,
  CarFront,
  Cherry,
  CodeXml,
  Crown,
  Gamepad2,
  LayoutGrid,
  Mail,
  ScanSearch,
  TreePalm,
  type LucideProps,
} from "lucide-react";

import { MiiFace } from "@/components/ui/MiiAvatar";

/** GitHub's mark (lucide no longer ships brand icons). */
export function GitHubMark(props: LucideProps) {
  const { size = 24, className } = props;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.82 1.19 3.08 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

const ICONS: Record<string, ComponentType<LucideProps>> = {
  projects: LayoutGrid,
  github: GitHubMark,
  about: MiiFace,
  contact: Mail,
  linkedin: BriefcaseBusiness,
  island: TreePalm,
  cherry: Cherry,
  kart: CarFront,
  chess: Crown,
  car: Car,
  scan: ScanSearch,
  game: Gamepad2,
  code: CodeXml,
};

/** Resolves a configured icon key, falling back to one based on the project category. */
export function resolveIcon(icon: string | undefined, category?: string) {
  if (icon && ICONS[icon]) return ICONS[icon];
  return category?.toLowerCase() === "game" ? Gamepad2 : CodeXml;
}

export function ChannelIcon({ icon, category, ...props }: { icon?: string; category?: string } & LucideProps) {
  // createElement makes it explicit that this picks one of the static icon components above.
  return createElement(resolveIcon(icon, category), { "aria-hidden": true, ...props });
}
